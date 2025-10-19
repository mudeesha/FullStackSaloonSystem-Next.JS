"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { services } from "@/lib/mock-data"
import { Clock, DollarSign } from "lucide-react"
import Image from "next/image"

export default function ServicesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const categories = [...new Set(services.map((s) => s.category))]

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our comprehensive range of beauty and wellness services
            </p>
          </motion.div>

          {categories.map((category) => (
            <motion.div
              key={category}
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6">{category}</h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {services
                  .filter((s) => s.category === category)
                  .map((service) => (
                    <motion.div
                      key={service.id}
                      className="rounded-lg border bg-card hover:shadow-lg transition-shadow overflow-hidden"
                      variants={itemVariants}
                    >
                      <div className="relative w-full h-48 bg-muted">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-accent" />
                              <span className="font-semibold">${service.price}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-accent" />
                              <span className="text-sm">{service.duration} min</span>
                            </div>
                          </div>
                        </div>
                        <Button asChild className="w-full">
                          <Link href="/book">Book Now</Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}
