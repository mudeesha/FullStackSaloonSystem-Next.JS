import type { Product, ProductAvailability } from "@prisma/client"

const AVAILABILITY_LABELS: Record<ProductAvailability, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
}

const LABEL_TO_AVAILABILITY: Record<string, ProductAvailability> = {
  "In Stock": "IN_STOCK",
  "Low Stock": "LOW_STOCK",
  "Out of Stock": "OUT_OF_STOCK",
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
}

export function formatProductForUi(product: Product) {
  const images = product.images ? (JSON.parse(product.images) as string[]) : []
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    availability: AVAILABILITY_LABELS[product.availability],
    mainImage: product.mainImage,
    images: images.length > 0 ? images : [product.mainImage],
    details: product.details ?? "",
  }
}

export function parseAvailability(value: string): ProductAvailability {
  return LABEL_TO_AVAILABILITY[value] ?? "IN_STOCK"
}
