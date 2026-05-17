"use client"

import { useState, useEffect, useMemo } from "react"
import { SearchBar } from "@/components/search-bar"
import { matchesListSearch } from "@/lib/list-search"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  description: string
  price: number
  availability: string
  mainImage: string
  images: string[]
  details: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.data ?? []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchProducts()
  }, [])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    availability: "In Stock",
    mainImage: "",
    images: ["", "", "", ""],
    details: "",
  })

  const handleAddProduct = async () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          images: formData.images.filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error("Failed")
      fetchProducts()
      toast({ title: "Success", description: "Product added successfully" })
      resetForm()
      setIsAddModalOpen(false)
    } catch {
      toast({ title: "Error", description: "Failed to add product", variant: "destructive" })
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    if (!formData.name || !formData.description || formData.price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          ...formData,
          price: Number(formData.price),
          images: formData.images.filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error("Failed")
      fetchProducts()
      toast({ title: "Success", description: "Product updated successfully" })
      resetForm()
      setEditingProduct(null)
    } catch {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" })
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      fetchProducts()
      toast({ title: "Success", description: "Product deleted successfully" })
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" })
    }
    setDeleteConfirm(null)
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      availability: product.availability,
      mainImage: product.mainImage,
      images: product.images,
      details: product.details,
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      availability: "In Stock",
      mainImage: "",
      images: ["", "", "", ""],
      details: "",
    })
  }

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

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        matchesListSearch(search, [p.id, p.name, p.description, p.price, p.availability]),
      ),
    [products, search],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="mt-1 text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setEditingProduct(null)
            setIsAddModalOpen(true)
          }}
          className="bg-primary hover:bg-[#B2223A] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <SearchBar onSearch={setSearch} placeholder="Search products by name, description, availability..." />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            className="rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="relative w-full h-40 bg-muted">
              <Image src={product.mainImage || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-bold text-primary">${product.price}</p>
                <p className="text-xs font-semibold text-green-600">{product.availability}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleEditClick(product)} size="sm" variant="outline" className="flex-1 gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => setDeleteConfirm(product.id)}
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-background">
              <h2 className="text-2xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingProduct(null)
                  resetForm()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  >
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Main Image URL</label>
                <input
                  type="text"
                  value={formData.mainImage}
                  onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Images (4 URLs)</label>
                {formData.images.map((image, index) => (
                  <input
                    key={index}
                    type="text"
                    value={image}
                    onChange={(e) => {
                      const newImages = [...formData.images]
                      newImages[index] = e.target.value
                      setFormData({ ...formData, images: newImages })
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-background mb-2"
                    placeholder={`Image ${index + 1} URL`}
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Full Details</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="Enter detailed product information"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  className="flex-1 bg-primary hover:bg-[#B2223A] text-white"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            className="bg-background rounded-lg max-w-sm w-full p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-bold mb-4">Delete Product?</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleDeleteProduct(deleteConfirm)} variant="destructive" className="flex-1">
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
