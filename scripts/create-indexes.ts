import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error("MongoDB environment variables are missing");
}

async function main() {
  const client = new MongoClient(uri!);

  try {
    await client.connect();

    const collection = client
      .db(dbName)
      .collection("products");

    // Index for searching products by name
    await collection.createIndex(
      { productName: 1 },
      { name: "product_name_idx" }
    );

    // Compound index for searching products by warehouse location
    await collection.createIndex(
      {
        "location.row": 1,
        "location.bay": 1,
        "location.shelf": 1
      },
      { name: "product_location_idx" }
    );

    console.log("Product indexes created successfully.");
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});