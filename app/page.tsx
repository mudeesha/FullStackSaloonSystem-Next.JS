"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { getServiceImageUrl } from "@/lib/image-url"

type FeaturedService = {
  id: number
  name: string
  description: string | null
  price: number
  durationMinutes: number
  image: string
}

type TeamMember = {
  id: number
  name: string
  role: string
  image: string
  specialties: string[]
}

type Testimonial = {
  id: number
  name: string
  text: string
  rating: number
}

type Product = {
  id: number
  name: string
  description: string
  price: number
  availability: string
  mainImage: string
  images: string[]
  details: string
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [servicesRes, teamRes, reviewsRes, productsRes] = await Promise.all([
          fetch("/api/public/services?limit=3&page=1"),
          fetch("/api/public/team"),
          fetch("/api/reviews?public=true"),
          fetch("/api/public/products?limit=4"),
        ])
        if (servicesRes.ok) {
          const data = await servicesRes.json()
          setFeaturedServices(data.data ?? [])
        }
        if (teamRes.ok) {
          setTeamMembers(await teamRes.json())
        }
        if (reviewsRes.ok) {
          const data = await reviewsRes.json()
          setTestimonials(data.data ?? [])
        }
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.data ?? [])
        }
      } catch (e) {
        console.error("Failed to load home data", e)
      } finally {
        setServicesLoading(false)
      }
    }
    load()
  }, [])

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
      <section className="relative min-h-[600px] overflow-hidden bg-background">
        <div className="absolute inset-0">
          <Image src="/hero.png" alt="NS Salon & Bridal" fill className="object-cover" priority />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center min-h-[600px]">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary text-sm md:text-base font-medium tracking-widest mb-4">NS SALON & BRIDAL</p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">Where Bridal Beauty Meets Modern Elegance</h1>
            <div className="flex justify-center mb-8">
              <div className="h-px w-16 bg-primary"></div>
              <div className="mx-4 text-primary">✦</div>
              <div className="h-px w-16 bg-primary"></div>
            </div>
            <p className="text-base md:text-lg mb-8 text-balance max-w-xl mx-auto">
              Bridal makeup, hair styling, grooming and salon services for your special day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-accent text-white font-medium" asChild>
                <Link href="/book">Book Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/5 font-medium">
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <div className="h-px w-12 bg-primary"></div>
              <div className="mx-3 text-primary text-lg">✦</div>
              <div className="h-px w-12 bg-primary"></div>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Our Services</h2>
            <p className="text-foreground/70 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
              We offer a comprehensive range of beauty treatments designed to meet all your needs and exceed your expectations. Our expert team is dedicated to providing you with an exceptional experience, using the latest techniques and top-quality products.
            </p>
          </motion.div>

          {servicesLoading ? (
            <p className="text-center text-muted-foreground">Loading services...</p>
          ) : featuredServices.length === 0 ? (
            <p className="text-center text-muted-foreground">No services available yet.</p>
          ) : (
          <motion.div
            key={featuredServices.map((s) => s.id).join("-")}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
              {featuredServices.map((service) => (
                <motion.div
                  key={service.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-xl hover:border-primary"
                  variants={itemVariants}
                >
                  <div className="relative h-48 w-full bg-muted">
                    <Image
                      src={getServiceImageUrl(service.image)}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2 text-lg font-serif font-bold">{service.name}</h3>
                    <p className="mb-4 flex-1 text-sm text-foreground/60 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-base font-semibold text-primary">${service.price}</span>
                      <span className="text-xs text-foreground/50 flex items-center gap-1">
                        <span>⏱</span> {service.durationMinutes} min
                      </span>
                    </div>
                    <Button className="w-full bg-primary text-white hover:bg-accent font-medium" asChild size="sm">
                      <Link href={`/book?service=${service.id}`}>Book Now</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
          </motion.div>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 font-medium" asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <div className="h-px w-12 bg-primary"></div>
              <div className="mx-3 text-primary text-lg">✦</div>
              <div className="h-px w-12 bg-primary"></div>
            </div>
            <h2 className="mb-6 font-serif text-4xl md:text-5xl font-bold">Our Products</h2>
            <p className="text-foreground/70 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
              Discover the finest selection of beauty products carefully curated to ensure you achieve salon-quality results at home.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {products.map((product) => (
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
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <div className="h-px w-12 bg-primary"></div>
              <div className="mx-3 text-primary text-lg">✦</div>
              <div className="h-px w-12 bg-primary"></div>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Meet Our Team</h2>
            <p className="text-foreground/70 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
              At Liyo Salon, our talented team is the heart of our success. Led by the visionary Dhanushka Chathuranga, our professionals are dedicated to delivering exceptional beauty services.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-lg"
                variants={itemVariants}
              >
                <div className="relative mb-6 h-64 w-full overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={member.image || "/professional-woman-stylist.jpg"}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex justify-center mb-4">
                  <div className="h-px w-8 bg-primary"></div>
                  <div className="mx-2 text-primary text-sm">✦</div>
                  <div className="h-px w-8 bg-primary"></div>
                </div>
                <h3 className="font-serif text-2xl font-bold mb-2">{member.name}</h3>
                <p className="mb-3 text-sm text-primary font-medium">{member.role}</p>
                <p className="text-xs text-foreground/50">
                  {member.specialties?.length ? member.specialties.join(", ") : "Salon professional"}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <div className="h-px w-12 bg-primary"></div>
              <div className="mx-3 text-primary text-lg">✦</div>
              <div className="h-px w-12 bg-primary"></div>
            </div>
            <h2 className="mb-6 font-serif text-4xl md:text-5xl font-bold">What Our Clients Say</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto text-base md:text-lg">Real experiences from our satisfied customers</p>
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
                className="p-6 rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-lg"
                variants={itemVariants}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground/70 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-primary">👥</span>
              </div>
              <div className="font-serif text-4xl md:text-5xl font-bold mb-2 text-primary">500+</div>
              <p className="text-foreground/70 text-lg">Happy Clients</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-primary">⭐</span>
              </div>
              <div className="font-serif text-4xl md:text-5xl font-bold mb-2 text-primary">10+</div>
              <p className="text-foreground/70 text-lg">Expert Staff</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-primary">✨</span>
              </div>
              <div className="font-serif text-4xl md:text-5xl font-bold mb-2 text-primary">15+</div>
              <p className="text-foreground/70 text-lg">Services</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <div className="h-px w-12 bg-primary"></div>
              <div className="mx-3 text-primary text-lg">✦</div>
              <div className="h-px w-12 bg-primary"></div>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Ready to Transform?</h2>
            <p className="text-lg text-foreground/70 mb-8">
              Book your appointment today and experience the difference
            </p>
            <Button size="lg" className="bg-primary hover:bg-accent text-white font-medium px-8" asChild>
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
