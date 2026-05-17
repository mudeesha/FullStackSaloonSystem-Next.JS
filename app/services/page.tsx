"use client";

import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, DollarSign, Search, Scissors, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  image?: string | null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#fbf7ef] dark:bg-[#0f0d0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(184,134,11,0.10),transparent_42%),radial-gradient(circle_at_bottom,rgba(184,134,11,0.06),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(184,134,11,0.12),transparent_42%),radial-gradient(circle_at_bottom,rgba(184,134,11,0.08),transparent_40%)]" />

      <div className="absolute -left-28 top-16 h-[430px] w-[430px] rounded-full border border-primary/10" />
      <div className="absolute -right-28 bottom-24 h-[520px] w-[520px] rounded-full border border-primary/10" />

      <div className="absolute left-0 top-20 hidden text-[245px] leading-none text-primary/10 dark:text-primary/20 lg:block">
        ❦
      </div>
      <div className="absolute right-0 top-[360px] hidden scale-x-[-1] text-[250px] leading-none text-primary/10 dark:text-primary/20 lg:block">
        ❦
      </div>

      <div className="absolute -left-20 bottom-[-120px] h-96 w-96 rounded-full bg-primary/[0.035] blur-3xl dark:bg-primary/[0.06]" />
      <div className="absolute -right-20 top-[-120px] h-96 w-96 rounded-full bg-primary/[0.04] blur-3xl dark:bg-primary/[0.06]" />
    </div>
  );
}

function SectionTitle() {
  return (
    <motion.div
      className="mx-auto mb-8 max-w-4xl text-center md:mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      <div className="mb-3 flex items-center justify-center text-primary">
        <div className="h-px w-28 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="mx-4 text-2xl leading-none">✽</div>
        <div className="h-px w-28 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      <h1 className="font-serif text-5xl font-bold leading-none tracking-tight text-foreground drop-shadow-sm md:text-6xl lg:text-7xl">
        Our Services
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground/70 dark:text-[#f3eadf]/75 md:text-lg">
        Explore our comprehensive range of beauty and wellness services
      </p>

      <div className="mt-3 flex items-center justify-center text-primary">
        <div className="h-px w-36 bg-gradient-to-r from-transparent to-primary/45" />
        <div className="mx-3 text-base leading-none">❧</div>
        <div className="h-px w-36 bg-gradient-to-l from-transparent to-primary/45" />
      </div>
    </motion.div>
  );
}

function serviceIcon(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes("hair")) return <Scissors className="h-7 w-7" />;
  if (lower.includes("makeup") || lower.includes("bridal")) {
    return <Sparkles className="h-7 w-7" />;
  }
  if (lower.includes("manicure") || lower.includes("nail")) {
    return <Star className="h-7 w-7" />;
  }

  return <Sparkles className="h-7 w-7" />;
}

export default function ServicesPage() {
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [limit] = useState(9);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchServices = async (pageNumber = 1, search = "") => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/public/services?page=${pageNumber}&limit=${limit}&search=${encodeURIComponent(search)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch services");
      }

      if (data.data) {
        setServices(data.data);
        setTotalPages(data.pagination?.totalPages ?? 1);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch services", error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    const timeout = window.setTimeout(() => {
      fetchServices(page, searchTerm);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [page, searchTerm, mounted]);

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads/")) return imagePath;
    return "/placeholder.svg";
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const skeletonCards = (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-primary/25 bg-background/75 shadow-[0_20px_55px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#14110d]/85"
        >
          <div className="h-44 w-full animate-pulse bg-primary/10" />
          <div className="p-6">
            <div className="mb-3 h-6 w-1/2 animate-pulse rounded bg-primary/10" />
            <div className="mb-6 h-4 w-3/4 animate-pulse rounded bg-primary/10" />
            <div className="mb-5 h-px w-full bg-primary/15" />
            <div className="mb-5 flex justify-between">
              <div className="h-5 w-20 animate-pulse rounded bg-primary/10" />
              <div className="h-5 w-20 animate-pulse rounded bg-primary/10" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-primary/15" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!mounted) {
    return (
      <PublicLayout>
        <main className="relative min-h-screen overflow-hidden">
          <DecorativeBackground />
          <section className="relative z-10 py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionTitle />
              {skeletonCards}
            </div>
          </section>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="relative min-h-screen overflow-hidden">
        <DecorativeBackground />

        <section className="relative z-10 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle />

            <motion.div
              className="mx-auto mb-9 max-w-xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/55 dark:text-[#f3eadf]/60" />
                <input
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search services..."
                  className="h-14 w-full rounded-xl border border-primary/35 bg-background/65 pl-14 pr-5 text-base text-foreground outline-none shadow-[0_12px_35px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all placeholder:text-foreground/45 focus:border-primary focus:bg-background/85 focus:ring-4 focus:ring-primary/10 dark:bg-[#14110d]/75 dark:text-[#f8efe4] dark:placeholder:text-[#f3eadf]/45"
                />
              </div>
            </motion.div>

            {loading ? (
              skeletonCards
            ) : services.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-xl rounded-2xl border border-primary/25 bg-background/75 p-10 text-center shadow-[0_20px_55px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#14110d]/85"
              >
                <h3 className="font-serif text-3xl font-bold text-foreground dark:text-[#f8efe4]">
                  {searchTerm ? "No services found" : "No Services Available"}
                </h3>
                <p className="mt-3 text-foreground/65 dark:text-[#f3eadf]/70">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "Check back later for our service offerings."}
                </p>

                {searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-6 border-primary/60 text-primary hover:bg-primary hover:text-white"
                    onClick={() => {
                      setSearchTerm("");
                      setPage(1);
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </motion.div>
            ) : (
              <>
                {searchTerm && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 text-center text-foreground/65 dark:text-[#f3eadf]/70"
                  >
                    Found {services.length} service
                    {services.length !== 1 ? "s" : ""} matching “{searchTerm}”
                  </motion.p>
                )}

                <motion.div
                  className="mx-auto grid max-w-6xl grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/35 bg-background/78 shadow-[0_22px_60px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/75 hover:shadow-[0_26px_75px_rgba(0,0,0,0.10)] dark:bg-[#14110d]/88 dark:shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
                      variants={itemVariants}
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-muted">
                        <Image
                          src={getImageUrl(service.image)}
                          alt={service.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(event) => {
                            const target = event.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-5 flex items-center gap-5">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-background/65 text-primary dark:bg-[#0f0d0a]/70">
                            {serviceIcon(service.name)}
                          </div>

                          <div className="min-w-0">
                            <h3 className="line-clamp-1 font-serif text-3xl font-bold leading-tight text-foreground dark:text-[#f8efe4]">
                              {service.name}
                            </h3>
                            <p className="mt-1 line-clamp-1 text-sm leading-6 text-foreground/65 dark:text-[#f3eadf]/70">
                              {service.description ||
                                "Professional service with excellent results."}
                            </p>
                          </div>
                        </div>

                        <div className="mb-5 flex items-center justify-center text-primary/60">
                          <div className="h-px flex-1 bg-primary/18" />
                          <span className="mx-3 text-sm">❧</span>
                          <div className="h-px flex-1 bg-primary/18" />
                        </div>

                        <div className="mb-5 grid grid-cols-2 items-center">
                          <div className="flex items-center gap-2 text-primary">
                            <DollarSign className="h-5 w-5" />
                            <span className="font-serif text-2xl leading-none">
                              Rs {service.price}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-2 border-l border-primary/15 text-foreground/70 dark:text-[#f3eadf]/75">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">
                              {service.durationMinutes} min
                            </span>
                          </div>
                        </div>

                        <Button
                          asChild
                          className="mt-auto h-11 w-full rounded-lg bg-primary text-sm font-semibold text-white shadow-[0_12px_28px_rgba(184,134,11,0.22)] transition-all hover:bg-[#a8792b] hover:text-white"
                        >
                          <Link href={`/book?service=${service.id}`}>
                            Book Now
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((current) => current - 1)}
                      className="border-primary/50 text-primary hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-foreground/60 dark:text-[#f3eadf]/70">
                      Page {page} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      className="border-primary/50 text-primary hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}