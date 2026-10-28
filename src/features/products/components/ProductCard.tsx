import Image from "next/image";

import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-image">
        <Image
          src={product.image}
          alt={product.productName}
          width={240}
          height={180}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "contain",
          }}
        />
      </div>

      <div className="product-details">
        <h2>{product.productName}</h2>

        <p className="product-price">
          {new Intl.NumberFormat("en-NZ", {
            style: "currency",
            currency: "NZD",
          }).format(product.price)}
        </p>

        <div className="warehouse-location">
          <h3>Warehouse Location</h3>

          <p>Row: {product.location.row}</p>
          <p>Bay: {product.location.bay}</p>
          <p>Shelf: {product.location.shelf}</p>
        </div>
      </div>
    </article>
  );
}