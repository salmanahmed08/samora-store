import React from "react";
import { prisma } from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <ProductsClient initialProducts={JSON.parse(JSON.stringify(products))} />
    </div>
  );
}
