import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"
import { formatProductForUi, parseAvailability } from "@/lib/product-format"

export async function GET() {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const products = await prisma.product.findMany({ orderBy: { id: "desc" } })
    return NextResponse.json({ data: products.map(formatProductForUi) })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { name, description, price, availability, mainImage, images, details } = body

    if (!name || price == null || !mainImage) {
      return NextResponse.json({ error: "Name, price, and main image are required" }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        availability: parseAvailability(availability || "In Stock"),
        mainImage,
        images: images ? JSON.stringify(images) : null,
        details: details || null,
      },
    })

    return NextResponse.json(formatProductForUi(product), { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { id, name, description, price, availability, mainImage, images, details } = body

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        availability: parseAvailability(availability || "In Stock"),
        mainImage,
        images: images ? JSON.stringify(images) : null,
        details: details || null,
      },
    })

    return NextResponse.json(formatProductForUi(product))
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await prisma.product.delete({ where: { id: Number(id) } })
    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
