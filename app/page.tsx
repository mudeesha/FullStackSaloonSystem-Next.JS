"use client";

import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
  Star,
  Twitter,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { getServiceImageUrl } from "@/lib/image-url";

type FeaturedService = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  image: string;
};

type TeamMember = {
  id: number;
  name: string;
  role: string;
  image: string;
  specialties: string[];
};

type Testimonial = {
  id: number;
  name: string;
  text: string;
  rating: number;
  clientImage?: string;
  status?: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  availability: string;
  mainImage: string;
  images: string[];
  details: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55 },
  },
};

const sampleTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Emily Roberts",
    text: "Absolutely love the experience! The staff is friendly, and the results are always beyond my expectations.",
    rating: 5,
    status: "Regular Client",
  },
  {
    id: 2,
    name: "Jessica Miller",
    text: "The best salon in town! From the ambiance to the service, everything is top-notch. Highly recommended!",
    rating: 5,
    status: "Happy Client",
  },
  {
    id: 3,
    name: "Sarah Thompson",
    text: "Professional, skilled, and attentive to detail. I always leave the salon feeling beautiful and confident.",
    rating: 5,
    status: "Satisfied Client",
  },
];

const serviceIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("hair")) return <Scissors className="h-7 w-7" />;
  if (lower.includes("facial")) return <Sparkles className="h-7 w-7" />;
  return <Star className="h-7 w-7" />;
};

function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.10),transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.12),transparent_48%)]" />
      <div className="absolute -left-24 top-8 h-96 w-96 rounded-full border border-primary/10" />
      <div className="absolute -right-24 bottom-8 h-[28rem] w-[28rem] rounded-full border border-primary/10" />
      <div className="absolute left-0 top-20 hidden text-[210px] leading-none text-primary/10 dark:text-primary/25 lg:block">
        ❦
      </div>
      <div className="absolute right-0 top-36 hidden scale-x-[-1] text-[230px] leading-none text-primary/10 dark:text-primary/25 lg:block">
        ❦
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
  lightText = false,
}: {
  title: string;
  description?: string;
  lightText?: boolean;
}) {
  return (
    <motion.div
      className="mx-auto mb-8 max-w-4xl text-center md:mb-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="mb-4 flex items-center justify-center text-primary">
        <div className="h-px w-28 bg-gradient-to-r from-transparent to-primary/70" />
        <div className="mx-4 text-2xl leading-none">✽</div>
        <div className="h-px w-28 bg-gradient-to-l from-transparent to-primary/70" />
      </div>
      <h2
        className={`font-serif text-5xl font-bold leading-tight tracking-tight drop-shadow-sm md:text-6xl lg:text-7xl ${
          lightText ? "text-[#f8efe4]" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      <div className="my-5 flex items-center justify-center text-primary">
        <div className="h-px w-32 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="mx-4 text-lg leading-none">❧</div>
        <div className="h-px w-32 bg-gradient-to-l from-transparent to-primary/60" />
      </div>
      {description && (
        <p
          className={`mx-auto max-w-3xl text-base leading-8 md:text-lg ${
            lightText ? "text-[#f3eadf]/85" : "text-foreground/70"
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}

function ThemedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden bg-[#fbf7ef] py-12 dark:bg-[#0f0d0a] md:py-16 ${className}`}
    >
      <DecorativeBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>(
    [],
  );
  const [servicesLoading, setServicesLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [servicesRes, teamRes, reviewsRes, productsRes] =
          await Promise.all([
            fetch("/api/public/services?limit=3&page=1"),
            fetch("/api/public/team"),
            fetch("/api/reviews?public=true"),
            fetch("/api/public/products?limit=4"),
          ]);
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setFeaturedServices(data.data ?? []);
        }
        if (teamRes.ok) {
          setTeamMembers(await teamRes.json());
        }
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setTestimonials(data.data ?? []);
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.data ?? []);
        }
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setServicesLoading(false);
      }
    };
    load();
  }, []);

  const visibleTestimonials = testimonials.length
    ? testimonials.slice(0, 3)
    : sampleTestimonials;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[850px] overflow-hidden bg-[#fbf3e6] dark:bg-[#090806]">
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt="NS Salon & Bridal"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbf3e6]/20 via-[#fbf3e6]/90 to-[#fbf3e6]/10 dark:from-black/45 dark:via-black/70 dark:to-black/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.25)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.38)_52%,rgba(0,0,0,0.80)_100%)]" />
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[42%] top-20 hidden text-[220px] leading-none text-primary/10 dark:text-primary/20 lg:block">
            ❦
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-primary/30" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-primary/30" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <motion.div
            className="ml-[34%] max-w-3xl text-left lg:ml-[36%] xl:ml-[34%]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.45em] text-primary md:text-base">
              NS Salon & Bridal
            </p>
            <h1 className="mb-7 max-w-[720px] font-serif text-5xl font-bold leading-[1.08] tracking-tight text-foreground dark:text-[#f7efe6] md:text-6xl lg:text-7xl">
              Where Bridal Beauty Meets Modern Elegance
            </h1>
            <div className="mb-7 flex items-center text-primary">
              <div className="h-px w-36 bg-primary/70" />
              <div className="mx-5 text-3xl">✽</div>
              <div className="h-px w-36 bg-primary/70" />
            </div>
            <p className="mb-9 max-w-xl text-lg leading-8 text-foreground/75 dark:text-[#f5eadf]/90">
              Bridal makeup, hair styling, grooming and salon services for your
              special day.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="rounded-lg bg-primary px-10 py-6 text-sm font-bold uppercase tracking-[0.22em] text-white shadow-[0_14px_34px_rgba(184,134,11,0.25)] hover:bg-[#a8792b]"
                asChild
              >
                <Link href="/book">Book Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg border-primary/70 bg-background/40 px-10 py-6 text-sm font-bold uppercase tracking-[0.22em] text-primary backdrop-blur hover:bg-primary/10"
                asChild
              >
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      <ThemedSection>
        <SectionTitle
          title="Our Services"
          description="We offer a comprehensive range of beauty treatments designed to meet all your needs and exceed your expectations. Our expert team is dedicated to providing you with an exceptional experience, using the latest techniques and top-quality products. Whether you’re looking for a refreshing new look or a relaxing retreat, we have the perfect solution to enhance your natural beauty and boost your confidence."
        />

        {servicesLoading ? (
          <p className="text-center text-muted-foreground">
            Loading services...
          </p>
        ) : featuredServices.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No services available yet.
          </p>
        ) : (
          <motion.div
            key={featuredServices.map((s) => s.id).join("-")}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featuredServices.map((service) => (
              <motion.div
                key={service.id}
                className="group overflow-hidden rounded-2xl border border-primary/35 bg-background/80 shadow-[0_24px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/80 dark:bg-[#14110d]/90 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
                variants={itemVariants}
              >
                <div className="relative h-56 w-full overflow-hidden bg-muted">
                  <Image
                    src={getServiceImageUrl(service.image)}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="p-7">
                  <div className="mb-5 flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary/45 text-primary">
                      {serviceIcon(service.name)}
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold text-foreground dark:text-[#f8efe4]">
                        {service.name}
                      </h3>
                      <p className="mt-2 line-clamp-1 text-sm text-foreground/65 dark:text-[#f3eadf]/70">
                        {service.description || "Professional salon service"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 flex items-center justify-center text-primary/70">
                    <div className="h-px flex-1 bg-primary/20" />
                    <span className="mx-3 text-sm">❧</span>
                    <div className="h-px flex-1 bg-primary/20" />
                  </div>

                  <div className="mb-6 flex items-center justify-between">
                    <span className="font-serif text-4xl text-primary">
                      ${service.price}
                    </span>
                    <span className="text-sm text-foreground/70 dark:text-[#f3eadf]/80">
                      {service.durationMinutes} min
                    </span>
                  </div>

                  <Button
                    className="w-full rounded-lg bg-primary py-6 text-base font-semibold text-white shadow-[0_12px_28px_rgba(184,134,11,0.22)] hover:bg-[#a8792b]"
                    asChild
                  >
                    <Link href={`/book?service=${service.id}`}>Book Now</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="rounded-lg border-primary/70 bg-background/40 px-12 py-6 text-lg text-primary backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-white dark:bg-[#14110d]/70 dark:hover:bg-primary dark:hover:text-white"
            asChild
          >
            <Link href="/services" className="inline-flex items-center gap-4">
              <span>✽</span> View All Services <span>✽</span>
            </Link>
          </Button>
        </div>
      </ThemedSection>

      {/* Products */}
      {/* <ThemedSection className="border-y border-primary/20">
        <SectionTitle
          title="Our Products"
          description="Discover the finest selection of beauty products carefully curated to ensure you achieve salon-quality results at home."
        />

        <motion.div
          className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-primary/30 bg-background/80 shadow-[0_20px_55px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/70 dark:bg-[#14110d]/90"
              variants={itemVariants}
            >
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <Image
                  src={product.mainImage || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="p-5">
                <h3 className="mb-2 line-clamp-1 font-serif text-2xl font-bold text-foreground dark:text-[#f8efe4]">
                  {product.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm leading-6 text-foreground/65 dark:text-[#f3eadf]/70">
                  {product.description}
                </p>
                <div className="mb-4 flex items-center justify-between border-t border-primary/20 pt-4">
                  <p className="font-serif text-3xl text-primary">
                    ${product.price}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
                    {product.availability}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedProduct(product)}
                  size="sm"
                  className="w-full rounded-lg bg-primary py-5 text-white hover:bg-[#a8792b]"
                >
                  Show Details
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 text-center">
          <Button
            className="rounded-lg bg-primary px-12 py-6 text-white hover:bg-[#a8792b]"
            asChild
          >
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </ThemedSection> */}

      {/* Team Section */}
      <ThemedSection>
        <SectionTitle
          title="Meet Our Team"
          description="At NS Salon, our talented team is the heart of our success. Led by the visionary Sumith Priyanga, our professionals are dedicated to delivering exceptional beauty services. Each team member brings a wealth of experience and a passion for excellence, ensuring you receive personalized care and outstanding results."
        />

        <motion.div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              className="group rounded-2xl border border-primary/40 bg-background/85 p-5 text-center shadow-[0_24px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/80 dark:bg-[#14110d]/90"
              variants={itemVariants}
            >
              <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={member.image || "/professional-woman-stylist.jpg"}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="relative mx-auto -mt-7 flex h-16 w-16 items-center justify-center rounded-full border border-primary/50 bg-background text-primary shadow-lg dark:bg-[#14110d]">
                <Sparkles className="h-8 w-8" />
              </div>

              <div className="mt-4 flex items-center justify-center text-primary/70">
                <div className="h-px w-24 bg-primary/20" />
                <span className="mx-3 text-sm">❧</span>
                <div className="h-px w-24 bg-primary/20" />
              </div>

              <h3 className="mt-4 font-serif text-4xl font-bold text-foreground dark:text-[#f8efe4]">
                {member.name}
              </h3>
              <p className="mt-2 text-lg font-medium text-primary">
                {member.role}
              </p>
              <p className="mt-4 text-sm text-foreground/65 dark:text-[#f3eadf]/70">
                {member.specialties?.length
                  ? member.specialties.join(", ")
                  : "Salon professional"}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </ThemedSection>

      {/* Testimonials + Stats + CTA */}
      <ThemedSection className="pb-16 md:pb-20">
        <SectionTitle
          title="What Our Clients Say"
          description="Real experiences from our satisfied customers"
        />

        <div className="mb-8 flex items-center justify-center gap-5 lg:gap-8">
          <button
            aria-label="Previous testimonial"
            className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/70 bg-background/80 text-primary shadow-sm transition-all hover:bg-primary hover:text-white md:flex dark:bg-[#14110d]/80"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <motion.div
            className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="rounded-2xl border border-primary/35 bg-background/80 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_22px_55px_rgba(0,0,0,0.08)] md:p-8 dark:bg-[#14110d]/90"
                variants={itemVariants}
              >
                <div className="mb-6 flex gap-1.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(testimonial.rating)
                          ? "fill-primary text-primary"
                          : "fill-primary/20 text-primary/20"
                      }`}
                    />
                  ))}
                </div>

                <p className="mb-7 min-h-[112px] text-base leading-8 text-foreground/85 dark:text-[#f3eadf]/85 md:text-lg">
                  “{testimonial.text}”
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/35 bg-primary/10">
                    {testimonial.clientImage ? (
                      <Image
                        src={testimonial.clientImage}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-serif text-2xl font-bold text-primary">
                        {testimonial.name?.charAt(0) || ["E", "J", "S"][index]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground dark:text-[#f8efe4]">
                      {testimonial.name}
                    </p>
                    <p className="text-base text-foreground/60 dark:text-[#f3eadf]/65">
                      {testimonial.status || "Satisfied Client"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <button
            aria-label="Next testimonial"
            className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/70 bg-background/80 text-primary shadow-sm transition-all hover:bg-primary hover:text-white md:flex dark:bg-[#14110d]/80"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>

        <div className="mb-12 flex justify-center gap-4">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              aria-label={`Go to testimonial slide ${i + 1}`}
              className={`h-3 w-3 rounded-full transition-all ${
                i === 1 ? "bg-primary" : "bg-primary/30 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>

        <motion.div
          className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-primary/35 bg-background/75 shadow-[0_18px_55px_rgba(0,0,0,0.05)] backdrop-blur-sm md:grid-cols-3 dark:bg-[#14110d]/85"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-6 px-8 py-8 text-center md:border-r md:border-primary/35"
          >
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
              <UsersRound className="h-11 w-11" />
            </div>
            <div className="text-left">
              <div className="font-serif text-5xl font-bold leading-none text-foreground dark:text-[#f8efe4] md:text-6xl">
                500+
              </div>
              <p className="mt-2 text-lg text-foreground/80 dark:text-[#f3eadf]/80">
                Happy Clients
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-6 border-t border-primary/35 px-8 py-8 text-center md:border-r md:border-t-0"
          >
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
              <UserRoundCheck className="h-11 w-11" />
            </div>
            <div className="text-left">
              <div className="font-serif text-5xl font-bold leading-none text-foreground dark:text-[#f8efe4] md:text-6xl">
                10+
              </div>
              <p className="mt-2 text-lg text-foreground/80 dark:text-[#f3eadf]/80">
                Expert Staff
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-6 border-t border-primary/35 px-8 py-8 text-center md:border-t-0"
          >
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
              <Scissors className="h-11 w-11" />
            </div>
            <div className="text-left">
              <div className="font-serif text-5xl font-bold leading-none text-foreground dark:text-[#f8efe4] md:text-6xl">
                15+
              </div>
              <p className="mt-2 text-lg text-foreground/80 dark:text-[#f3eadf]/80">
                Services
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto mt-14 max-w-4xl text-center md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <SectionTitle
            title="Ready to Transform?"
            description="Book your appointment today and experience the difference"
          />

          <Button
            size="lg"
            className="group rounded-xl border border-primary/60 bg-gradient-to-r from-primary via-[#c8963d] to-primary px-10 py-7 text-base font-semibold text-white shadow-[0_16px_45px_rgba(184,126,32,0.28)] transition-all hover:-translate-y-0.5 hover:from-[#b47a25] hover:via-primary hover:to-[#b47a25] hover:shadow-[0_20px_55px_rgba(184,126,32,0.36)] md:text-lg"
            asChild
          >
            <Link href="/book" className="inline-flex items-center gap-3">
              <CalendarDays className="h-6 w-6 transition-transform group-hover:scale-110" />
              Book Your Appointment
            </Link>
          </Button>
        </motion.div>
      </ThemedSection>

      <ProductDetailModal
        product={selectedProduct!}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </PublicLayout>
  );
}