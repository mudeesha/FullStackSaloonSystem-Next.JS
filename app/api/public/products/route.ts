import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatProductForUi } from "@/lib/product-format"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 50

    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      take: limit,
    })

    return NextResponse.json({ data: products.map(formatProductForUi) })
  } catch (error) {
    console.error("Error fetching public products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
