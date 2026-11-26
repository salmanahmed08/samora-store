import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductFormClient from "@/components/admin/ProductFormClient";

export const dynamic = "force-dynamic";

interface EditProductProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductProps) {
  const { id } = params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return <ProductFormClient initialData={product} isEdit={true} />;
}
