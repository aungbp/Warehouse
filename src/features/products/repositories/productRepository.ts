import { ObjectId } from "mongodb";

import clientPromise from "@/src/lib/mongondb";
import type { Product } from "../types/product";

function getDatabase() {
  const dbName = process.env.MONGODB_DB;

  if (!dbName) {
    throw new Error("MONGODB_DB is not configured.");
  }

  return clientPromise.then((client) => client.db(dbName));
}

function formatProduct(document: {
  _id: ObjectId;
  productName: string;
  image: string;
  price: number;
  location?: {
    row?: string;
    bay?: string;
    shelf?: string;
  };
}): Product {
  return {
    id: document._id.toString(),
    productName: document.productName,
    image: document.image,
    price: document.price,
    location: {
      row: document.location?.row ?? "",
      bay: document.location?.bay ?? "",
      shelf: document.location?.shelf ?? "",
    },
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDatabase();

  const documents = await db
    .collection("products")
    .find({})
    .limit(500)
    .toArray();

  return documents.map((document) =>
    formatProduct({
      _id: document._id,
      productName: document.productName,
      image: document.image,
      price: document.price,
      location: document.location,
    })
  );
}

export async function searchProductsByName(
  query: string
): Promise<Product[]> {
  const db = await getDatabase();

  // Escape regular-expression characters in the user's search.
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const documents = await db
    .collection("products")
    .find({
      productName: {
        $regex: escapedQuery,
        $options: "i",
      },
    })
    .limit(50)
    .toArray();

  return documents.map((document) =>
    formatProduct({
      _id: document._id,
      productName: document.productName,
      image: document.image,
      price: document.price,
      location: document.location,
    })
  );
}