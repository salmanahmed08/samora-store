"use client";

import React from "react";
import ProductFormClient from "@/components/admin/ProductFormClient";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  pricePKR: number;
  compareAtPrice: number | null;
  category: string;
  sizes: string;
  stock: number;
  images: string;
  featured: boolean;
  status: string;
}

export default function EditProductClient({ product }: { product: Product }) {
  return <ProductFormClient initialData={product} isEdit={true} />;
}
