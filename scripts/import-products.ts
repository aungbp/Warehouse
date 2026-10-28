import { readFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";
import { setServers } from "node:dns";

setServers(["1.1.1.1", "8.8.8.8"]);


interface ProductInput {
  productName: string;
  price: number;
  location: {
    row: string;
    bay: string;
    shelf: string;
  };
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error(
    "MONGODB_URI and MONGODB_DB must be configured in .env.local"
  );
}

function validateProduct(value: unknown): ProductInput {
  if (typeof value !== "object" || value === null) {
    throw new Error("Each product must be an object");
  }

  const product = value as Partial<ProductInput>;

  if (
    typeof product.productName !== "string" ||
    !product.productName.trim()
  ) {
    throw new Error("Product name is required");
  }

  if (
    typeof product.price !== "number" ||
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    throw new Error(
      `Invalid price for product: ${product.productName}`
    );
  }

  const location = product.location;

  if (
    !location ||
    typeof location.row !== "string" ||
    !location.row.trim() ||
    typeof location.bay !== "string" ||
    !location.bay.trim() ||
    typeof location.shelf !== "string" ||
    !location.shelf.trim()
  ) {
    throw new Error(
      `Invalid location for product: ${product.productName}`
    );
  }

  return {
    productName: product.productName.trim(),
    price: product.price,
    location: {
      row: location.row.trim(),
      bay: location.bay.trim(),
      shelf: location.shelf.trim(),
    },
  };
}

async function main() {
  const filePath = path.resolve("data/products.json");
  const fileContent = await readFile(filePath, "utf8");

  const parsed: unknown = JSON.parse(fileContent);

  if (!Array.isArray(parsed)) {
    throw new Error("products.json must contain an array");
  }

  const products = parsed.map(validateProduct);

  const client = new MongoClient(uri!);

  try {
    await client.connect();

    const collection = client
      .db(dbName)
      .collection("products");

    // This initial import replaces the existing catalogue.
    // Do not use this operation for incremental updates.
    await collection.deleteMany({});

    if (products.length > 0) {
      await collection.insertMany(
        products.map((product) => ({
          ...product,
          normalizedName: product.productName
            .normalize("NFKC")
            .toLowerCase(),
        }))
      );
    }

    console.log(`Imported ${products.length} products.`);
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error("Product import failed:", error);
  process.exitCode = 1;
});