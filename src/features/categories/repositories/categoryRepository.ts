import { ObjectId } from "mongodb";

import clientPromise from "@/src/lib/mongondb";
import type { Category } from "../types/category";

function getDatabase() {
  const dbName = process.env.MONGODB_DB;

  if (!dbName) {
    throw new Error("MONGODB_DB is not configured.");
  }

  return clientPromise.then((client) => client.db(dbName));
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();

  const documents = await db
    .collection("categories")
    .find({})
    .sort({ displayOrder: 1 })
    .toArray();

  return documents.map((document) => ({
    id: (document._id as ObjectId).toString(),
    name: document.categoryName as string,
    displayOrder: document.displayOrder as number,
  }));
  
}