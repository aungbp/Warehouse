import { NextResponse } from "next/server";

import { searchProducts } from "../../../../src/features/products/services/productServices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (query === null || !query.trim()) {
    return NextResponse.json(
      {
        products: [],
        totalReturned: 0,
        message: "Please enter a product name.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const products = await searchProducts(query);

    return NextResponse.json(
      {
        products,
        totalReturned: products.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Product search failed:", error);

    return NextResponse.json(
      {
        error: "Unable to search products.",
      },
      {
        status: 500,
      }
    );
  }
}