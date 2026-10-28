"use client";

import { useState } from "react";

interface ProductSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function ProductSearch({
  onSearch,
  isLoading,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query);
  }

  function handleChange(value: string) {
    setQuery(value);

    // Clearing the input clears the displayed results.
    if (!value.trim()) {
      onSearch("");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="product-search">
        Search for a product
      </label>

      <div className="search-controls">
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="e.g. Apple Juice"
          maxLength={100}
        />

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}