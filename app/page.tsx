
"use client";

import { useEffect, useState } from "react";

import ProductSearch from "@/src/features/products/components/ProductSearch";
import ProductList from "@/src/features/products/components/ProductList";

import type { Product } from "@/src/features/products/types/product";

interface Category {
  id: string;
  name: string;
  displayOrder: number;
}

interface ProductResponse {
  products: Product[];
  totalReturned: number;
  message?: string;
  error?: string;
}

interface CategoryResponse {
  categories: Category[];
  error?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Load categories when the page first opens.
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        const data: CategoryResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load categories.");
        }

        setCategories(
          [...(data.categories ?? [])].sort(
            (a, b) => a.displayOrder - b.displayOrder
          )
        );
      } catch (err) {
        console.error("Category loading failed:", err);

        setCategoryError(
          err instanceof Error
            ? err.message
            : "Unable to load categories."
        );
      } finally {
        setIsLoadingCategories(false);
      }
    }

    void loadCategories();
  }, []);

  // Load all products or products from a selected category.
  async function loadProductsForCategory(categoryId: string) {
    setIsLoading(true);
    setHasSearched(true);
    setError("");
    setProducts([]);

    try {
      const queryString =
        categoryId === "all"
          ? ""
          : `?categoryId=${encodeURIComponent(categoryId)}`;

      const response = await fetch(`/api/products${queryString}`, {
        cache: "no-store",
      });

      const data: ProductResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? data.error ?? "Unable to load products."
        );
      }

      setProducts(data.products ?? []);
    } catch (err) {
      console.error("Product loading failed:", err);

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

  // Handle category dropdown changes.
  async function handleCategoryChange(categoryId: string) {
    setSelectedCategoryId(categoryId);
    await loadProductsForCategory(categoryId);
  }

  // Handle product-name searches.
  async function handleSearch(query: string) {
    const normalizedQuery = query.trim();

    // If the search is empty, show the selected category again.
    if (!normalizedQuery) {
      await loadProductsForCategory(selectedCategoryId);
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

      const data: ProductResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? data.error ?? "Unable to search products."
        );
      }

      setProducts(data.products ?? []);
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

  const selectedCategoryName =
    selectedCategoryId === "all"
      ? "All products"
      : categories.find(
          (category) => category.id === selectedCategoryId
        )?.name ?? "Selected category";

  return (
    <main className="warehouse-page">
      <header className="page-header">
        <h1>Warehouse Locator</h1>

        <p>
          Search for a product and find its location in the warehouse.
        </p>
      </header>

      <section
        className="product-finder"
        aria-label="Find warehouse products"
      >
        <label
          className="category-label"
          htmlFor="category-select"
        >
          Browse by category
        </label>

        <select
          id="category-select"
          className="category-select"
          value={selectedCategoryId}
          onChange={(event) =>
            void handleCategoryChange(event.target.value)
          }
          disabled={isLoadingCategories || isLoading}
        >
          <option value="all">All products</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {categoryError && (
          <p role="alert" className="error-message">
            {categoryError}
          </p>
        )}

        <ProductSearch
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </section>

      {isLoading && (
        <p role="status">Loading products...</p>
      )}

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      {!isLoading &&
        !error &&
        hasSearched &&
        products.length > 0 && (
          <>
            <p className="results-count" aria-live="polite">
              Showing {products.length} product
              {products.length === 1 ? "" : "s"} for{" "}
              {selectedCategoryName}.
            </p>

            <ProductList products={products} />
          </>
        )}

      {!isLoading &&
        !error &&
        hasSearched &&
        products.length === 0 && (
          <p role="status">
            No products found. Try another category or product name.
          </p>
        )}
    </main>
  );
}