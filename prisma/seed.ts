import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await hash("password123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@salon.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@salon.com",
      password,
      role: "ADMIN",
      phone: "555-000-0001",
    },
  })

  const staff1 = await prisma.user.upsert({
    where: { email: "sarah@salon.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "sarah@salon.com",
      password,
      role: "STAFF",
      phone: "555-111-1111",
    },
  })

  const staff2 = await prisma.user.upsert({
    where: { email: "emma@salon.com" },
    update: {},
    create: {
      name: "Emma Davis",
      email: "emma@salon.com",
      password,
      role: "STAFF",
      phone: "555-111-2222",
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: "customer@salon.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@salon.com",
      password,
      role: "CUSTOMER",
      phone: "555-222-1111",
    },
  })

  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Haircut",
        description: "Professional haircut with styling",
        price: 45,
        durationMinutes: 30,
        image: "/images/service-haircut.jpg",
      },
    }),
    prisma.service.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Manicure",
        description: "Professional manicure with polish",
        price: 35,
        durationMinutes: 45,
        image: "/images/service-nails.jpg",
      },
    }),
    prisma.service.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Facial",
        description: "Relaxing facial treatment",
        price: 65,
        durationMinutes: 60,
        image: "/images/service-massage.jpg",
      },
    }),
  ])

  for (const service of services) {
    const existing = await prisma.staffService.findFirst({
      where: { staffId: staff1.id, serviceId: service.id },
    })
    if (!existing) {
      await prisma.staffService.create({ data: { staffId: staff1.id, serviceId: service.id } })
    }
    const existing2 = await prisma.staffService.findFirst({
      where: { staffId: staff2.id, serviceId: service.id },
    })
    if (!existing2) {
      await prisma.staffService.create({ data: { staffId: staff2.id, serviceId: service.id } })
    }
  }

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const
  for (const staffId of [staff1.id, staff2.id]) {
    for (const day of days) {
      await prisma.staffAvailability.create({
        data: { staffId, dayOfWeek: day, startTime: "09:00", endTime: "17:00", isActive: true },
      }).catch(() => {})
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const start = new Date(tomorrow)
  start.setHours(10, 0, 0, 0)
  const end = new Date(start.getTime() + 30 * 60000)

  await prisma.appointment.create({
    data: {
      customerId: customer.id,
      staffId: staff1.id,
      appointmentDate: tomorrow,
      startTime: start,
      endTime: end,
      status: "PENDING",
      services: {
        create: {
          serviceId: services[0].id,
          price: services[0].price,
          durationMinutes: services[0].durationMinutes,
        },
      },
    },
  }).catch(() => {})

  const productSeed = [
    {
      name: "Premium Hair Serum",
      description: "Nourishing hair serum for silky smooth hair",
      price: 29.99,
      availability: "IN_STOCK" as const,
      mainImage: "/images/product-serum.jpg",
      images: JSON.stringify(["/images/product-serum.jpg"]),
      details: "Our premium hair serum restores shine and smoothness.",
    },
    {
      name: "Organic Face Mask",
      description: "Deep cleansing face mask with natural ingredients",
      price: 24.99,
      availability: "IN_STOCK" as const,
      mainImage: "/images/product-mask.jpg",
      images: JSON.stringify(["/images/product-mask.jpg"]),
      details: "Use 2-3 times per week for best results.",
    },
    {
      name: "Luxury Nail Polish Set",
      description: "Set of 12 premium nail polish colors",
      price: 39.99,
      availability: "LOW_STOCK" as const,
      mainImage: "/images/product-nails.jpg",
      images: JSON.stringify(["/images/product-nails.jpg"]),
      details: "Long-lasting vibrant colors.",
    },
  ]

  for (const p of productSeed) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } })
    if (!existing) {
      await prisma.product.create({ data: p })
    }
  }

  console.log("Seed complete. Login accounts:")
  console.log("  Admin:    admin@salon.com / password123")
  console.log("  Staff:    sarah@salon.com / password123")
  console.log("  Customer: customer@salon.com / password123")
  console.log("Admin id:", admin.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
