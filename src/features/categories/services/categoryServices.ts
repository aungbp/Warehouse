import { getAllCategories } from "../repositories/categoryRepository";
import type { Category } from "../types/category";

export async function getCategories(): Promise<Category[]> {
  return getAllCategories();
}