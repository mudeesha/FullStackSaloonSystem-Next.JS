import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"
import type { Role } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const where = role
      ? { role: role.toUpperCase() as Role }
      : { role: { in: ["CUSTOMER", "STAFF"] as Role[] } }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        staffServices: {
          include: { service: { select: { name: true } } },
        },
      },
      orderBy: { name: "asc" },
    })

    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      role: u.role.toLowerCase(),
      joinDate: u.createdAt.toISOString().split("T")[0],
      specialties: u.staffServices?.map((s) => s.service.name) ?? [],
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { name, email, password, phone, role, serviceIds } = await request.json()
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const userRole = role.toUpperCase() as Role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 10),
        phone: phone || null,
        role: userRole,
        ...(userRole === "STAFF" &&
          Array.isArray(serviceIds) &&
          serviceIds.length > 0 && {
            staffServices: {
              create: serviceIds.map((id: number | string) => ({
                serviceId: Number(id),
              })),
            },
          }),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id, name, email, phone, role, password, serviceIds } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (name) data.name = name
    if (email) data.email = email
    if (phone !== undefined) data.phone = phone || null
    if (role) data.role = role.toUpperCase()
    if (password) data.password = await hash(password, 10)

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    })

    if (Array.isArray(serviceIds) && (role?.toUpperCase() === "STAFF" || user.role === "STAFF")) {
      await prisma.staffService.deleteMany({ where: { staffId: Number(id) } })
      if (serviceIds.length > 0) {
        await prisma.staffService.createMany({
          data: serviceIds.map((serviceId: number | string) => ({
            staffId: Number(id),
            serviceId: Number(serviceId),
          })),
        })
      }
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
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
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: Number(id) } })
    return NextResponse.json({ message: "User deleted" })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
