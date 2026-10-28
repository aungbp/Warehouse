import ProductCard from "./ProductCard";

import type { Product } from "../types/product";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({
  products,
}: ProductListProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="product-list" aria-label="Product search results">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </section>
  );
}