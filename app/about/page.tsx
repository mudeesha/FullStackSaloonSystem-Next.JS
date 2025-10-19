"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { motion } from "framer-motion"
import { teamMembers } from "@/lib/mock-data"
import { CheckCircle } from "lucide-react"

export default function AboutPage() {
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

  const values = [
    { title: "Excellence", description: "We strive for perfection in every service" },
    { title: "Professionalism", description: "Our team is highly trained and certified" },
    { title: "Customer Care", description: "Your satisfaction is our top priority" },
    { title: "Innovation", description: "We use the latest techniques and products" },
  ]

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover our story and commitment to beauty and wellness
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div
            className="mb-16 p-8 rounded-lg bg-muted"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              Founded in 2015, our salon has been a trusted destination for beauty and wellness services. We started
              with a simple mission: to provide exceptional services in a welcoming and relaxing environment.
            </p>
            <p className="text-muted-foreground">
              Over the years, we've grown to become one of the most respected salons in the area, serving thousands of
              satisfied clients and building a team of expert professionals.
            </p>
          </motion.div>

          {/* Values Section */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8">Our Values</h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {values.map((value, index) => (
                <motion.div key={index} className="p-6 rounded-lg border bg-card flex gap-4" variants={itemVariants}>
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8">Meet Our Team</h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {teamMembers.map((member) => (
                <motion.div key={member.id} className="text-center" variants={itemVariants}>
                  <div className="mb-4 rounded-lg overflow-hidden h-48 bg-background">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-accent text-sm mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.specialties.join(", ")}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
