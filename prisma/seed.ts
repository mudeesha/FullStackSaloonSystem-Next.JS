import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

function atTime(base: Date, hours: number, minutes = 0) {
  const d = new Date(base)
  d.setHours(hours, minutes, 0, 0)
  return d
}

function dayStart(offsetDays: number) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(0, 0, 0, 0)
  return d
}

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

  const sarah = await prisma.user.upsert({
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

  const emma = await prisma.user.upsert({
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

  const customer2 = await prisma.user.upsert({
    where: { email: "jane@salon.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane@salon.com",
      password,
      role: "CUSTOMER",
      phone: "555-222-2222",
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

  const staffMembers = [sarah, emma]
  for (const staff of staffMembers) {
    for (const service of services) {
      const existing = await prisma.staffService.findFirst({
        where: { staffId: staff.id, serviceId: service.id },
      })
      if (!existing) {
        await prisma.staffService.create({
          data: { staffId: staff.id, serviceId: service.id },
        })
      }
    }
  }

  const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const
  for (const staff of staffMembers) {
    await prisma.staffAvailability.deleteMany({ where: { staffId: staff.id } })
    for (const day of weekdays) {
      await prisma.staffAvailability.create({
        data: {
          staffId: staff.id,
          dayOfWeek: day,
          startTime: day === "SATURDAY" ? "10:00" : "09:00",
          endTime: day === "SATURDAY" ? "14:00" : "17:00",
          isActive: true,
        },
      })
    }
  }

  const seedAppointments = [
    {
      key: "today-pending",
      customerId: customer.id,
      staffId: sarah.id,
      dayOffset: 0,
      hour: 10,
      duration: 30,
      status: "PENDING" as const,
      serviceIndex: 0,
      payment: null,
      review: null,
    },
    {
      key: "today-confirmed",
      customerId: customer2.id,
      staffId: sarah.id,
      dayOffset: 0,
      hour: 14,
      duration: 45,
      status: "CONFIRMED" as const,
      serviceIndex: 1,
      payment: null,
      review: null,
    },
    {
      key: "tomorrow-pending",
      customerId: customer.id,
      staffId: emma.id,
      dayOffset: 1,
      hour: 11,
      duration: 60,
      status: "PENDING" as const,
      serviceIndex: 2,
      payment: null,
      review: null,
    },
    {
      key: "past-completed-paid",
      customerId: customer.id,
      staffId: emma.id,
      dayOffset: -7,
      hour: 15,
      duration: 30,
      status: "COMPLETED" as const,
      serviceIndex: 0,
      payment: "PAID" as const,
      review: { rating: 5, comment: "Excellent haircut, very professional!" },
    },
    {
      key: "past-completed-pending-pay",
      customerId: customer2.id,
      staffId: sarah.id,
      dayOffset: -3,
      hour: 13,
      duration: 45,
      status: "COMPLETED" as const,
      serviceIndex: 1,
      payment: "PENDING" as const,
      review: null,
    },
    {
      key: "past-cancelled",
      customerId: customer.id,
      staffId: sarah.id,
      dayOffset: -2,
      hour: 9,
      duration: 30,
      status: "CANCELLED" as const,
      serviceIndex: 0,
      payment: null,
      review: null,
    },
  ]

  for (const item of seedAppointments) {
    const service = services[item.serviceIndex]
    const appointmentDate = dayStart(item.dayOffset)
    const startTime = atTime(appointmentDate, item.hour)
    const endTime = new Date(startTime.getTime() + item.duration * 60000)

    const existing = await prisma.appointment.findFirst({
      where: {
        customerId: item.customerId,
        staffId: item.staffId,
        appointmentDate,
        startTime,
      },
    })

    const appointment =
      existing ??
      (await prisma.appointment.create({
        data: {
          customerId: item.customerId,
          staffId: item.staffId,
          appointmentDate,
          startTime,
          endTime,
          status: item.status,
          services: {
            create: {
              serviceId: service.id,
              price: service.price,
              durationMinutes: service.durationMinutes,
            },
          },
        },
      }))

    if (existing) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: item.status },
      })
    }

    if (item.payment) {
      await prisma.payment.upsert({
        where: { appointmentId: appointment.id },
        create: {
          appointmentId: appointment.id,
          amount: service.price,
          status: item.payment,
          method: item.payment === "PAID" ? "CARD" : "CASH",
          transactionId: item.payment === "PAID" ? `TXN-${appointment.id}` : null,
        },
        update: { status: item.payment, amount: service.price },
      })
    }

    if (item.review) {
      await prisma.review.upsert({
        where: { appointmentId: appointment.id },
        create: {
          appointmentId: appointment.id,
          rating: item.review.rating,
          comment: item.review.comment,
        },
        update: {
          rating: item.review.rating,
          comment: item.review.comment,
        },
      })
    }
  }

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

  const contactSamples = [
    { name: "Alex Brown", email: "alex@example.com", message: "Do you offer bridal packages?" },
    { name: "Maria Lee", email: "maria@example.com", message: "What are your Saturday hours?" },
  ]

  for (const msg of contactSamples) {
    const existing = await prisma.contactMessage.findFirst({
      where: { email: msg.email, message: msg.message },
    })
    if (!existing) {
      await prisma.contactMessage.create({ data: msg })
    }
  }

  console.log("Seed complete. Login accounts:")
  console.log("  Admin:     admin@salon.com / password123")
  console.log("  Staff:     sarah@salon.com / password123")
  console.log("  Staff:     emma@salon.com / password123")
  console.log("  Customer:  customer@salon.com / password123")
  console.log("  Customer:  jane@salon.com / password123")
  console.log("Admin id:", admin.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
