import { NextResponse } from "next/server";

import { getProducts } from "../../../src/features/products/services/productServices";

export async function GET() {
  try {
    const products = await getProducts();

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