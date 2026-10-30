import { NextResponse } from "next/server";

import { getCategories } from "../../../src/features/categories/services/categoryServices";

export async function GET() {
  try {
    const categories = await getCategories();


    return NextResponse.json(
      {
        categories,
        totalReturned: categories.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}