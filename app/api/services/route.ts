// app/api/services/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 9;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause manually
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({
      data: services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const durationMinutes = formData.get("durationMinutes") as string
    const imageFile = formData.get("image") as File | null

    let imagePath = null

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const uniqueName = `${uuidv4()}-${imageFile.name}`
      const uploadDir = path.join(process.cwd(), "public/uploads/services")
      
      // Ensure upload directory exists (you might want to create it manually first)
      // For now, we'll create it if it doesn't exist
      const fs = await import("fs")
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      
      const filePath = path.join(uploadDir, uniqueName)
      await writeFile(filePath, buffer)
      
      imagePath = `/uploads/services/${uniqueName}`
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes),
        image: imagePath,
      },
    })
    return NextResponse.json(newService)
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const durationMinutes = formData.get("durationMinutes") as string
    const imageFile = formData.get("image") as File | null

    // Get current service to handle image updates
    const currentService = await prisma.service.findUnique({
      where: { id: Number(id) }
    })

    let imagePath = currentService?.image || null

    // Handle image upload if new file provided
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const uniqueName = `${uuidv4()}-${imageFile.name}`
      const uploadDir = path.join(process.cwd(), "public/uploads/services")
      
      const fs = await import("fs")
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      
      const filePath = path.join(uploadDir, uniqueName)
      await writeFile(filePath, buffer)
      
      imagePath = `/uploads/services/${uniqueName}`

      // Delete old image if exists
      if (currentService?.image) {
        const oldImagePath = path.join(process.cwd(), "public", currentService.image)
        try {
          await fs.promises.unlink(oldImagePath)
        } catch (error) {
          console.error("Error deleting old image:", error)
        }
      }
    }

    const updated = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes),
        image: imagePath,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })
    
    // Get service to delete associated image
    const service = await prisma.service.findUnique({
      where: { id: Number(id) }
    })
    
    await prisma.service.delete({ where: { id: Number(id) } })
    
    // Delete associated image file
    if (service?.image) {
      const fs = await import("fs")
      const imagePath = path.join(process.cwd(), "public", service.image)
      try {
        await fs.promises.unlink(imagePath)
      } catch (error) {
        console.error("Error deleting image file:", error)
      }
    }
    
    return NextResponse.json({ message: "Service deleted" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}