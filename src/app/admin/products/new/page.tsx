import React from "react";
import ProductFormClient from "@/components/admin/ProductFormClient";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return <ProductFormClient isEdit={false} />;
}
