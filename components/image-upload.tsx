"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  currentImage?: string
  label?: string
}

export function ImageUpload({ onImageSelect, currentImage, label = "Upload Image" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        onImageSelect(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {preview ? (
        <div className="relative w-32 h-32">
          <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover rounded-lg" />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
      )}

      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
        {label}
      </Button>
    </div>
  )
}
