"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ProductDetailModalProps {
  product: {
    id: number
    name: string
    description: string
    price: number
    availability: string
    mainImage: string
    images: string[]
    details: string
  }
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-background">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-full h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-muted"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-primary">${product.price}</p>
              <p
                className={`text-sm font-semibold mt-2 ${product.availability === "In Stock" ? "text-green-600" : "text-yellow-600"}`}
              >
                {product.availability}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Details</h3>
              <p className="text-muted-foreground">{product.details}</p>
            </div>

            <Button className="w-full bg-primary hover:bg-[#B2223A] text-white">Add to Cart</Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
