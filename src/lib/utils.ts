import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return "PKR " + new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

let orderCounter = 1001;

export function generateOrderNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SMR-${num}`;
}

export function buildWhatsAppLink(phone: string = "923344826415", message: string): string {
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("03")) {
    cleanPhone = "92" + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith("92") && cleanPhone.length === 10) {
    cleanPhone = "92" + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
