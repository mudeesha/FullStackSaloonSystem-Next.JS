// app/api/public/staff/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    let where = {}
    if (serviceId) {
      where = {
        staffServices: {
          some: {
            serviceId: parseInt(serviceId)
          }
        }
      }
    }

    const staff = await prisma.user.findMany({
      where: {
        ...where,
        role: 'STAFF'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    )
  }
}