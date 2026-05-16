import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const auth = await requireSession()
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueName = `${uuidv4()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const uploadDir = path.join(process.cwd(), "public/uploads/profiles")

    const fs = await import("fs")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    const profileImage = `/uploads/profiles/${uniqueName}`

    const current = await prisma.user.findUnique({ where: { id: auth.session.id } })
    if (current?.profileImage?.startsWith("/uploads/profiles/")) {
      const oldPath = path.join(process.cwd(), "public", current.profileImage)
      try {
        await fs.promises.unlink(oldPath)
      } catch {
        /* ignore */
      }
    }

    const user = await prisma.user.update({
      where: { id: auth.session.id },
      data: { profileImage },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
      },
    })

    return NextResponse.json({ user, profileImage })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Failed to upload profile image" }, { status: 500 })
  }
}
