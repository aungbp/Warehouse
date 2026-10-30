import {
  getAllProducts,
  searchProductsByName,
  getProductsByCategory,
} from "../repositories/productRepository";

import { validateProductSearch } from "../validators/productValidator";

import type { Product } from "../types/product";

export async function getProducts(categoryId?: string | null): Promise<Product[]> {
  if (categoryId) {
    return getProductsByCategory(categoryId);
  }
  return getAllProducts();
}

export async function searchProducts(
  input: unknown
): Promise<Product[]> {
  const validation = validateProductSearch(input);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return searchProductsByName(validation.query);
}