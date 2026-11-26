import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // Compute live product counts per category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.product.count({
          where: {
            status: "ACTIVE",
            OR: [
              { categoryId: cat.id },
              { category: cat.name },
              { category: cat.slug },
            ],
          },
        });
        return {
          ...cat,
          productCount: count,
        };
      })
    );

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
