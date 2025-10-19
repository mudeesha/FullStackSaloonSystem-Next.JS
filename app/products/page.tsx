"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { mockProducts } from "@/lib/mock-data"
import { useState } from "react"
import Image from "next/image"
import { ProductDetailModal } from "@/components/product-detail-modal"

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<(typeof mockProducts)[0] | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover our premium selection of beauty and wellness products
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {mockProducts.map((product) => (
              <motion.div
                key={product.id}
                className="rounded-lg border bg-card hover:shadow-lg transition-shadow overflow-hidden"
                variants={itemVariants}
              >
                <div className="relative w-full h-48 bg-muted">
                  <Image
                    src={product.mainImage || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-primary">${product.price}</p>
                    <p
                      className={`text-sm font-semibold ${product.availability === "In Stock" ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {product.availability}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full bg-primary hover:bg-[#B2223A] text-white"
                  >
                    Show Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <ProductDetailModal
        product={selectedProduct!}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </PublicLayout>
  )
}
