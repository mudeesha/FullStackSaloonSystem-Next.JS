"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ProductDetailModal } from "@/components/product-detail-modal"

type Product = {
  id: number
  name: string
  description: string
  price: number
  availability: string
  mainImage: string
  images: string[]
  details: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetch("/api/public/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.data ?? []))
      .catch(console.error)
  }, [])

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
            <p className="text-lg text-muted-foreground">Premium salon products for home care</p>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No products available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border bg-card hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="relative w-full h-48 bg-muted">
                    <Image
                      src={product.mainImage || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-lg font-bold text-primary">${product.price}</p>
                      <p className="text-xs font-semibold text-green-600">{product.availability}</p>
                    </div>
                    <Button
                      onClick={() => setSelectedProduct(product)}
                      size="sm"
                      className="w-full bg-primary hover:bg-[#B2223A] text-white"
                    >
                      Show Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </PublicLayout>
  )
}
