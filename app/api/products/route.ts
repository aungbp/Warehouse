import { NextResponse } from "next/server";

import { getProducts } from "../../../src/features/products/services/productServices";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const categoryId = url.searchParams.get("categoryId");
  
  try {
    const products = await getProducts(categoryId);

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
    console.error("Failed to retrieve products:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve products.",
      },
      {
        status: 500,
      }
    );
  }
}