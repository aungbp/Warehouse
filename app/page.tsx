"use client";

import { useState } from "react";

import ProductSearch from "@/src/features/products/components/ProductSearch";
import ProductList from "@/src/features/products/components/ProductList";

import type { Product } from "@/src/features/products/types/product";

interface ProductSearchResponse {
  products: Product[];
  totalReturned: number;
  message?: string;
  error?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(query: string) {
    const normalizedQuery = query.trim();

    // Do not call the API with an empty search.
    if (!normalizedQuery) {
      setProducts([]);
      setHasSearched(false);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setError("");
    setProducts([]);

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(normalizedQuery)}`,
        {
          cache: "no-store",
        }
      );

      const data: ProductSearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? data.error ?? "Unable to search products."
        );
      }

      setProducts(data.products);
    } catch (err) {
      console.error("Search failed:", err);

      setProducts([]);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="warehouse-page">
      <header className="page-header">
        <h1>Warehouse Locator</h1>

        <p>
          Search for a product and find its location in the warehouse.
        </p>
      </header>

      <ProductSearch
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {isLoading && (
        <p role="status">Searching for products...</p>
      )}

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      {!isLoading && !error && hasSearched && products.length > 0 && (
        <>
          <p className="results-count" aria-live="polite">
            Found {products.length} product
            {products.length === 1 ? "" : "s"}.
          </p>

          <ProductList products={products} />
        </>
      )}

      {!isLoading && !error && hasSearched && products.length === 0 && (
        <p role="status">
          No matching products found. Try another product name.
        </p>
      )}
    </main>
  );
}