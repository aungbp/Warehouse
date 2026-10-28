import { readdir } from "node:fs/promises";
import path from "node:path";
import clientPromise from "../src/lib/mongondb";

const IMAGE_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "images",
  "products"
);

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const APPLY_CHANGES = process.argv.includes("--apply");

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

interface ProductDocument {
  _id: unknown;
  productName: string;
  image?: string | null;
}

async function main() {
  const dbName = process.env.MONGODB_DB;

  if (!dbName) {
    throw new Error("MONGODB_DB is missing from your .env.local file.");
  }

  // Read image files from the local folder.
  const files = await readdir(IMAGE_DIRECTORY, {
    withFileTypes: true,
  });

  const imageFiles = files
    .filter((file) => file.isFile())
    .map((file) => file.name)
    .filter((file) =>
      IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())
    );

  // Build a lookup using normalized filenames.
  const imageMap = new Map<string, string[]>();

  for (const filename of imageFiles) {
    const key = normalizeName(filename);

    const existing = imageMap.get(key) ?? [];
    existing.push(filename);
    imageMap.set(key, existing);
  }

  const client = await clientPromise;
  const db = client.db(dbName);
  const collection = db.collection<ProductDocument>("products");

  const products = await collection.find({}).toArray();

  let matched = 0;
  let updated = 0;
  let alreadyAssigned = 0;
  let unmatched = 0;
  let ambiguous = 0;

  console.log(`\nMode: ${APPLY_CHANGES ? "APPLY CHANGES" : "PREVIEW ONLY"}`);
  console.log(`Image folder: ${IMAGE_DIRECTORY}`);
  console.log(`Images found: ${imageFiles.length}`);
  console.log(`Products found: ${products.length}\n`);

  for (const product of products) {
    const productName = product.productName;

    if (!productName) {
      console.log("SKIP: Product has no productName.");
      continue;
    }

    // Preserve existing image paths.
    if (product.image?.trim()) {
      alreadyAssigned++;
      continue;
    }

    const key = normalizeName(productName);
    const matches = imageMap.get(key) ?? [];

    if (matches.length === 0) {
      unmatched++;
      console.log(`NO MATCH: ${productName}`);
      continue;
    }

    if (matches.length > 1) {
      ambiguous++;
      console.log(
        `AMBIGUOUS: ${productName} -> ${matches.join(", ")}`
      );
      continue;
    }

    const filename = matches[0];
    const imagePath = `/images/products/${filename}`;

    matched++;

    console.log(
      `${APPLY_CHANGES ? "UPDATE" : "PREVIEW"}: ${productName} -> ${imagePath}`
    );

    if (APPLY_CHANGES) {
      const result = await collection.updateOne(
        {
          _id: product._id,
          $or: [
            { image: null },
            { image: { $exists: false } },
            { image: "" },
          ],
        },
        {
          $set: { image: imagePath },
        }
      );

      if (result.modifiedCount === 1) {
        updated++;
      } else {
        console.log(`SKIPPED: ${productName} changed before the update.`);
      }
    }
  }

  console.log("\n========== SUMMARY ==========");
  console.log(`Products with matching images: ${matched}`);
  console.log(`Products already assigned an image: ${alreadyAssigned}`);
  console.log(`Products without a matching image: ${unmatched}`);
  console.log(`Products with ambiguous matches: ${ambiguous}`);

  if (APPLY_CHANGES) {
    console.log(`Products successfully updated: ${updated}`);
  } else {
    console.log("\nPreview only. No database changes were made.");
    console.log("Run with --apply to update MongoDB.");
  }
}

main().catch((error: unknown) => {
  console.error("Image update failed:", error);
  process.exitCode = 1;
});