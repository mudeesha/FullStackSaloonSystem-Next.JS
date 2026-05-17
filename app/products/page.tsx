"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { SearchBar } from "@/components/search-bar"
import { matchesListSearch } from "@/lib/list-search"
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
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        matchesListSearch(search, [p.id, p.name, p.description, p.price, p.availability]),
      ),
    [products, search],
  )

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
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Our Products</h1>
            <p className="mb-6 text-lg text-muted-foreground max-w-3xl">
              Discover the finest selection of beauty products at Liyo Salon, carefully curated to ensure you achieve salon-quality results at home. Our range includes top-tier brands and exclusive items that cater to all your hair, skin, and beauty needs.
            </p>
            <div className="w-full max-w-sm">
              <SearchBar onSearch={setSearch} placeholder="Search products..." />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {search ? "No products match your search." : "No products available yet."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border bg-card hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full"
                >
                  <div className="relative w-full h-48 bg-muted">
                    <Image
                      src={product.mainImage || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-semibold mb-2 text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex-grow line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-lg font-bold text-primary">${product.price}</p>
                      <p className="text-xs font-semibold text-green-600">{product.availability}</p>
                    </div>
                    <Button
                      onClick={() => setSelectedProduct(product)}
                      size="sm"
                      className="w-full bg-primary hover:bg-[#B2223A] text-white mt-auto"
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
