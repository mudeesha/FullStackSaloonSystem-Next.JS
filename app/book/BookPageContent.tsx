"use client";

// app/book/BookPageContent.tsx

import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServiceImageUrl } from "@/lib/image-url";
import { InfoModal } from "@/components/info-modal";
import {
  Clock,
  DollarSign,
  Eye,
  Search,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";

const createBookingSchema = (isLoggedIn: boolean) => {
  return z.object({
    date: z.string().min(1, "Please select a date"),
    time: z.string().min(1, "Please select a time"),
    staffId: z.string().min(1, "Please select a staff member"),
    ...(isLoggedIn
      ? {}
      : {
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.string().email("Invalid email address"),
        }),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
  });
};

type BookingFormData = z.infer<ReturnType<typeof createBookingSchema>>;

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  image?: string | null;
};

type StaffMember = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

type StaffAvailability = {
  id: number;
  staffId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
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

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
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
        {title}
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground/70 dark:text-[#f3eadf]/75 md:text-lg">
        {description}
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

function ServiceCard({
  item,
  onBook,
}: {
  item: Service;
  onBook: () => void;
}) {
  return (
    <motion.div
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/35 bg-background/78 shadow-[0_22px_60px_rgba(0,0,0,0.07)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/75 hover:shadow-[0_26px_75px_rgba(0,0,0,0.10)] dark:bg-[#14110d]/88 dark:shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
      variants={itemVariants}
    >
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <Image
          src={getServiceImageUrl(item.image)}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-background/65 text-primary dark:bg-[#0f0d0a]/70">
            {serviceIcon(item.name)}
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-1 font-serif text-3xl font-bold leading-tight text-foreground dark:text-[#f8efe4]">
              {item.name}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm leading-6 text-foreground/65 dark:text-[#f3eadf]/70">
              {item.description || "Professional service with excellent results."}
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
            <span className="font-serif text-2xl leading-none">Rs {item.price}</span>
          </div>

          <div className="flex items-center justify-end gap-2 border-l border-primary/15 text-foreground/70 dark:text-[#f3eadf]/75">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{item.durationMinutes} min</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={onBook}
          className="mt-auto h-11 w-full rounded-lg bg-primary text-sm font-semibold text-white shadow-[0_12px_28px_rgba(184,134,11,0.22)] transition-all hover:bg-[#a8792b] hover:text-white"
        >
          Book This Service
        </Button>
      </div>
    </motion.div>
  );
}

function BookPageLoading() {
  return (
    <PublicLayout>
      <main className="relative min-h-screen overflow-hidden">
        <DecorativeBackground />
        <section className="relative z-10 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Book Your Appointment"
              description="Choose a service to get started"
            />

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
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export default function BookPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [staffAvailability, setStaffAvailability] = useState<StaffAvailability[]>([]);
  const [loading, setLoading] = useState(!!serviceId);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(createBookingSchema(isLoggedIn)),
  });

  const watchDate = watch("date");
  const watchTime = watch("time");

  const filteredServiceOptions = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase();

    if (!query) return serviceOptions;

    return serviceOptions.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query) ||
        String(item.price).includes(query) ||
        String(item.durationMinutes).includes(query)
      );
    });
  }, [serviceOptions, serviceSearch]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.user) {
          setIsLoggedIn(true);
          setUserData(data.user);
          setValue("phone", data.user.phone || "");
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuth();
  }, [setValue]);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) {
        try {
          setLoading(true);
          const res = await fetch("/api/public/services?limit=50&page=1");
          const data = await res.json();

          if (res.ok) {
            setServiceOptions(data.data ?? []);
          } else {
            throw new Error(data.error || "Failed to fetch services");
          }
        } catch (error) {
          console.error("Failed to fetch services", error);
          toast({
            title: "Error",
            description: "Failed to load services",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);

        const [serviceRes, staffRes] = await Promise.all([
          fetch(`/api/public/services/${serviceId}`),
          fetch(`/api/public/staff?serviceId=${serviceId}`),
        ]);

        if (serviceRes.ok) {
          const serviceData = await serviceRes.json();
          setService(serviceData);
        } else {
          throw new Error("Failed to fetch service");
        }

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaffMembers(staffData);
        } else {
          throw new Error("Failed to fetch staff");
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast({
          title: "Error",
          description: "Failed to load service information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId, toast]);

  useEffect(() => {
    const fetchStaffAvailability = async () => {
      if (!watchDate || !watchTime || !service) return;

      try {
        const res = await fetch(
          `/api/public/availability?date=${watchDate}&time=${watchTime}&serviceId=${service.id}`,
        );

        if (res.ok) {
          const data = await res.json();
          setAvailableStaff(data.availableStaff);
          setStaffAvailability(data.availability);
        }
      } catch (error) {
        console.error("Failed to fetch availability", error);
      }
    };

    fetchStaffAvailability();
  }, [watchDate, watchTime, service]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      const bookingData = {
        serviceId: service?.id,
        staffId: parseInt(data.staffId),
        appointmentDate: data.date,
        startTime: data.time,
        customerName: isLoggedIn && userData ? userData.name : data.name,
        customerEmail: isLoggedIn && userData ? userData.email : data.email,
        customerPhone: data.phone,
        userId: isLoggedIn ? userData?.id : undefined,
      };

      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        toast({
          title: "Booking Confirmed",
          description: "Your appointment has been successfully booked!",
        });
        setBookingSuccess(true);
        reset();
        setTimeout(() => setBookingSuccess(false), 3000);
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  const isStaffAvailable = (staffId: number) => {
    return availableStaff.some((staff) => staff.id === staffId);
  };

  if (loading) {
    return <BookPageLoading />;
  }

  if (!serviceId) {
    return (
      <PublicLayout>
        <main className="relative min-h-screen overflow-hidden">
          <DecorativeBackground />

          <section className="relative z-10 py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionTitle
                title="Book Your Appointment"
                description="Choose a service to get started"
              />

              <motion.div
                className="mx-auto mb-9 max-w-xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/55 dark:text-[#f3eadf]/60" />
                  <input
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder="Search services..."
                    className="h-14 w-full rounded-xl border border-primary/35 bg-background/65 pl-14 pr-5 text-base text-foreground outline-none shadow-[0_12px_35px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all placeholder:text-foreground/45 focus:border-primary focus:bg-background/85 focus:ring-4 focus:ring-primary/10 dark:bg-[#14110d]/75 dark:text-[#f8efe4] dark:placeholder:text-[#f3eadf]/45"
                  />
                </div>
              </motion.div>

              {serviceOptions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto max-w-xl rounded-2xl border border-primary/25 bg-background/75 p-10 text-center shadow-[0_20px_55px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#14110d]/85"
                >
                  <p className="mb-6 text-foreground/65 dark:text-[#f3eadf]/70">
                    No services available right now.
                  </p>
                  <Button
                    asChild
                    className="bg-primary text-white hover:bg-[#a8792b] hover:text-white"
                  >
                    <Link href="/services">Browse Services</Link>
                  </Button>
                </motion.div>
              ) : filteredServiceOptions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto max-w-xl rounded-2xl border border-primary/25 bg-background/75 p-10 text-center shadow-[0_20px_55px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-[#14110d]/85"
                >
                  <h3 className="font-serif text-3xl font-bold text-foreground dark:text-[#f8efe4]">
                    No services found
                  </h3>
                  <p className="mt-3 text-foreground/65 dark:text-[#f3eadf]/70">
                    Try adjusting your search terms.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 border-primary/60 text-primary hover:bg-primary hover:text-white"
                    onClick={() => setServiceSearch("")}
                  >
                    Clear Search
                  </Button>
                </motion.div>
              ) : (
                <>
                  {serviceSearch && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 text-center text-foreground/65 dark:text-[#f3eadf]/70"
                    >
                      Found {filteredServiceOptions.length} service
                      {filteredServiceOptions.length !== 1 ? "s" : ""} matching “{serviceSearch}”
                    </motion.p>
                  )}

                  <motion.div
                    className="mx-auto grid max-w-6xl grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredServiceOptions.map((item) => (
                      <ServiceCard
                        key={item.id}
                        item={item}
                        onBook={() => router.push(`/book?service=${item.id}`)}
                      />
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </section>
        </main>
      </PublicLayout>
    );
  }

  if (!service) {
    return (
      <PublicLayout>
        <main className="relative min-h-screen overflow-hidden">
          <DecorativeBackground />
          <section className="relative z-10 py-12 md:py-16">
            <div className="mx-auto max-w-2xl px-4 text-center">
              <SectionTitle
                title="Service Not Found"
                description="The service you're looking for doesn't exist."
              />
              <Button
                asChild
                className="bg-primary text-white hover:bg-[#a8792b] hover:text-white"
              >
                <Link href="/services">Browse Services</Link>
              </Button>
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
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Book Your Appointment"
              description="Schedule your next beauty and wellness service"
            />

            {isLoggedIn && userData && (
              <motion.div
                className="mx-auto mb-8 max-w-3xl rounded-2xl border border-primary/20 bg-background/70 p-4 text-center shadow-[0_18px_45px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:bg-[#14110d]/80"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-foreground/75 dark:text-[#f3eadf]/75">
                  <strong className="text-primary">Welcome back, {userData.name}!</strong>{" "}
                  Your information has been pre-filled.
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="sticky top-28 overflow-hidden rounded-2xl border border-primary/35 bg-background/78 shadow-[0_22px_60px_rgba(0,0,0,0.07)] backdrop-blur-sm dark:bg-[#14110d]/88 dark:shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <div className="relative h-52 w-full overflow-hidden bg-muted">
                    <Image
                      src={getServiceImageUrl(service.image)}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>

                  <div className="p-6">
                    <div className="mb-5 flex items-center gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-background/65 text-primary dark:bg-[#0f0d0a]/70">
                        {serviceIcon(service.name)}
                      </div>

                      <div>
                        <h2 className="font-serif text-3xl font-bold text-foreground dark:text-[#f8efe4]">
                          {service.name}
                        </h2>
                        <p className="mt-1 text-sm text-foreground/65 dark:text-[#f3eadf]/70">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 flex items-center justify-center text-primary/60">
                      <div className="h-px flex-1 bg-primary/18" />
                      <span className="mx-3 text-sm">❧</span>
                      <div className="h-px flex-1 bg-primary/18" />
                    </div>

                    <div className="grid grid-cols-2 items-center">
                      <div className="flex items-center gap-2 text-primary">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-serif text-2xl">Rs {service.price}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 border-l border-primary/15 text-foreground/70 dark:text-[#f3eadf]/75">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">
                          {service.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="rounded-2xl border border-primary/35 bg-background/78 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.07)] backdrop-blur-sm dark:bg-[#14110d]/88 dark:shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-8">
                  {bookingSuccess && (
                    <motion.div
                      className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="font-semibold">Booking Confirmed!</p>
                      <p className="text-sm">You will receive a confirmation email shortly.</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-foreground/80 dark:text-[#f3eadf]/80">
                          Date
                        </label>
                        <Input
                          {...register("date")}
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className={`h-12 border-primary/25 bg-background/70 focus-visible:ring-primary/20 dark:bg-[#0f0d0a]/70 ${
                            errors.date ? "border-red-500" : ""
                          }`}
                        />
                        {errors.date && (
                          <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-foreground/80 dark:text-[#f3eadf]/80">
                          Time
                        </label>
                        <select
                          {...register("time")}
                          className="h-12 w-full rounded-lg border border-primary/25 bg-background/70 px-4 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-[#0f0d0a]/70 dark:text-[#f8efe4]"
                        >
                          <option value="">Select a time</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                        {errors.time && (
                          <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>
                        )}
                      </div>
                    </div>

                    {watchDate && watchTime && (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-foreground/80 dark:text-[#f3eadf]/80">
                          Select Staff
                        </label>
                        <select
                          {...register("staffId")}
                          className="h-12 w-full rounded-lg border border-primary/25 bg-background/70 px-4 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-[#0f0d0a]/70 dark:text-[#f8efe4]"
                        >
                          <option value="">Select a staff member</option>
                          {staffMembers.map((staff) => {
                            const isAvailable = isStaffAvailable(staff.id);
                            const staffAvail = staffAvailability.find(
                              (a) => a.staffId === staff.id,
                            );

                            return (
                              <option
                                key={staff.id}
                                value={staff.id}
                                disabled={!isAvailable}
                                className={!isAvailable ? "text-gray-400" : ""}
                              >
                                {staff.name}
                                {!isAvailable && staffAvail && ` (Available from ${staffAvail.startTime})`}
                                {!isAvailable && !staffAvail && " (Not available)"}
                              </option>
                            );
                          })}
                        </select>
                        {errors.staffId && (
                          <p className="mt-1 text-sm text-red-500">{errors.staffId.message}</p>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowAvailabilityModal(true)}
                          className="mt-3 flex items-center gap-2 text-xs font-medium text-foreground/60 transition-colors hover:text-primary dark:text-[#f3eadf]/65 dark:hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Show staff availability
                        </button>
                      </div>
                    )}

                    {!isLoggedIn && (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-foreground/80 dark:text-[#f3eadf]/80">
                            Full Name
                          </label>
                          <Input
                            {...register("name")}
                            placeholder="John Doe"
                            className={`h-12 border-primary/25 bg-background/70 focus-visible:ring-primary/20 dark:bg-[#0f0d0a]/70 ${
                              errors.name ? "border-red-500" : ""
                            }`}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-foreground/80 dark:text-[#f3eadf]/80">
                            Email
                          </label>
                          <Input
                            {...register("email")}
                            type="email"
                            placeholder="your@email.com"
                            className={`h-12 border-primary/25 bg-background/70 focus-visible:ring-primary/20 dark:bg-[#0f0d0a]/70 ${
                              errors.email ? "border-red-500" : ""
                            }`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                          )}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground/80 dark:text-[#f3eadf]/80">
                        Phone
                      </label>
                      <Input
                        {...register("phone")}
                        placeholder="(+94) 77 449 5349"
                        className={`h-12 border-primary/25 bg-background/70 focus-visible:ring-primary/20 dark:bg-[#0f0d0a]/70 ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                        defaultValue={userData?.phone || ""}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-white shadow-[0_12px_28px_rgba(184,134,11,0.22)] hover:bg-[#a8792b] hover:text-white"
                    >
                      Confirm Booking
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <InfoModal
          open={showAvailabilityModal}
          onClose={() => setShowAvailabilityModal(false)}
          title="Staff Availability"
          description={`Working hours for ${watchDate}`}
        >
          <div className="space-y-3">
            {staffMembers.map((staff) => {
              const avail = staffAvailability.find((a) => a.staffId === staff.id);
              const isAvailable = isStaffAvailable(staff.id);

              return (
                <div
                  key={staff.id}
                  className="flex items-center justify-between rounded-lg border border-primary/20 bg-card p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{staff.name}</p>
                    {avail ? (
                      <p className="text-sm text-muted-foreground">
                        {avail.startTime} - {avail.endTime}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not scheduled</p>
                    )}
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isAvailable
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {isAvailable ? "Available" : "Unavailable"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Staff availability is checked for your selected time slot and service duration.
            </p>
          </div>
        </InfoModal>
      </main>
    </PublicLayout>
  );
}