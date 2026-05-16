import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        staffServices: {
          include: {
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    const team = staff.map((member, index) => ({
      id: member.id,
      name: member.name,
      role: member.staffServices[0]?.service.name
        ? `${member.staffServices[0].service.name} Specialist`
        : "Salon Specialist",
      image: `/professional-woman-stylist.jpg`,
      specialties: member.staffServices.map((s) => s.service.name),
      email: member.email,
      phone: member.phone,
    }))

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}
