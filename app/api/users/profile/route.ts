import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export async function GET() {
  try {
    const auth = await requireSession()
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        gender: true,
        profileImage: true,
        staffServices: {
          include: { service: { select: { name: true } } },
        },
      },
    })

    const specialties =
      user?.staffServices?.map((s) => s.service.name).join(", ") ?? ""

    return NextResponse.json({ user: user ? { ...user, specialties } : null })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireSession()
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { name, phone, gender, password, currentPassword } = await request.json()

    const data: Record<string, unknown> = {
      ...(name && { name }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(gender && { gender }),
    }

    if (password) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 })
      }
      const current = await prisma.user.findUnique({ where: { id: auth.session.id } })
      if (!current) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      const { compare } = await import("bcryptjs")
      if (!(await compare(currentPassword, current.password))) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      data.password = await hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: auth.session.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        gender: true,
        profileImage: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
