"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { services, teamMembers, testimonials, mockProducts } from "@/lib/mock-data"
import Image from "next/image"
import { useState } from "react"
import { ProductDetailModal } from "@/components/product-detail-modal"

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<(typeof mockProducts)[0] | null>(null)

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

  return (
    <PublicLayout>
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-secondary/20 to-background overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/hero-banner.jpg" alt="Salon hero" fill className="object-cover" priority />
        </div>
        <div className="container px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Your Premier Salon Experience</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance">
              Discover luxury beauty and wellness services in a relaxing atmosphere. Book your appointment today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-[#B2223A] text-white" asChild>
                <Link href="/book">Book Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">View Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular beauty and wellness services
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.slice(0, 3).map((service) => (
              <motion.div
                key={service.id}
                className="p-6 rounded-lg border border-secondary bg-card hover:shadow-lg transition-shadow dark:border-secondary/30"
                variants={itemVariants}
              >
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">${service.price}</span>
                  <span className="text-sm text-muted-foreground">{service.duration} min</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <Button className="bg-primary hover:bg-[#B2223A] text-white" asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/10 dark:bg-secondary/5">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Premium beauty and wellness products for your home care routine
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {mockProducts.slice(0, 4).map((product) => (
              <motion.div
                key={product.id}
                className="rounded-lg border bg-card hover:shadow-lg transition-shadow overflow-hidden"
                variants={itemVariants}
              >
                <div className="relative w-full h-40 bg-muted">
                  <Image
                    src={product.mainImage || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-primary">${product.price}</p>
                    <p className="text-xs font-semibold text-green-600">{product.availability}</p>
                  </div>
                  <Button
                    onClick={() => setSelectedProduct(product)}
                    size="sm"
                    className="w-full bg-primary hover:bg-[#B2223A] text-white"
                  >
                    Show Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <Button className="bg-primary hover:bg-[#B2223A] text-white" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Expert professionals dedicated to your beauty and wellness
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member) => (
              <motion.div key={member.id} className="text-center" variants={itemVariants}>
                <div className="mb-4 rounded-lg overflow-hidden h-48 bg-background relative">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.specialties.join(", ")}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-secondary/10 dark:bg-secondary/5">
        <div className="container px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Real experiences from our satisfied customers</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                className="p-6 rounded-lg border border-secondary bg-card dark:border-secondary/30"
                variants={itemVariants}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-white dark:bg-primary">
        <div className="container px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <p className="text-lg">Happy Clients</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-4xl md:text-5xl font-bold mb-2">10+</div>
              <p className="text-lg">Expert Staff</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <p className="text-lg">Services</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book your appointment today and experience the difference
            </p>
            <Button size="lg" className="bg-primary hover:bg-[#B2223A] text-white" asChild>
              <Link href="/book">Book Your Appointment</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <ProductDetailModal
        product={selectedProduct!}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </PublicLayout>
  )
}
