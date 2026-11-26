import React from "react";
import { prisma } from "@/lib/prisma";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await prisma.product.count({
        where: {
          OR: [
            { categoryId: cat.id },
            { category: cat.name },
            { category: cat.slug },
          ],
        },
      });
      return {
        ...JSON.parse(JSON.stringify(cat)),
        productCount: count,
      };
    })
  );

  return <CategoriesClient initialCategories={categoriesWithCount} />;
}
