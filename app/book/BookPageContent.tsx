// app/book/BookPageContent.tsx
"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getServiceImageUrl } from "@/lib/image-url"
import { InfoModal } from "@/components/info-modal"
import { Eye } from "lucide-react"

// Conditional schema based on login status
const createBookingSchema = (isLoggedIn: boolean) => {
  return z.object({
    date: z.string().min(1, "Please select a date"),
    time: z.string().min(1, "Please select a time"),
    staffId: z.string().min(1, "Please select a staff member"),
    ...(isLoggedIn ? {} : {
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
    }),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
  })
}

type BookingFormData = z.infer<ReturnType<typeof createBookingSchema>>

type Service = {
  id: number
  name: string
  description: string
  price: number
  durationMinutes: number
  image?: string | null
}

type StaffMember = {
  id: number
  name: string
  email: string
  phone?: string
}

type StaffAvailability = {
  id: number
  staffId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

type User = {
  id: number
  name: string
  email: string
  phone?: string
}

function BookPageLoading() {
  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container px-4 max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-1/2"></div>
            <div className="h-4 bg-muted rounded mb-12 w-3/4"></div>
            <div className="p-8 rounded-lg border bg-card space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

export default function BookPageContent() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("service")

  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [service, setService] = useState<Service | null>(null)
  const [serviceOptions, setServiceOptions] = useState<Service[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([])
  const [staffAvailability, setStaffAvailability] = useState<StaffAvailability[]>([])
  const [loading, setLoading] = useState(!!serviceId)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)

  // Create form with conditional schema
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(createBookingSchema(isLoggedIn)),
  })

  const watchDate = watch("date")
  const watchTime = watch("time")

  // Check if user is logged in and load user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (data.user) {
          setIsLoggedIn(true)
          setUserData(data.user)
          setValue('phone', data.user.phone || '')
        } else {
          setIsLoggedIn(false)
          setUserData(null)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsLoggedIn(false)
        setUserData(null)
      }
    }
  
    checkAuth()
  }, [setValue])

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) {
        try {
          setLoading(true)
          const res = await fetch("/api/public/services?limit=50&page=1")
          const data = await res.json()
          if (res.ok) {
            setServiceOptions(data.data ?? [])
          }
        } catch (error) {
          console.error("Failed to fetch services", error)
          toast({
            title: "Error",
            description: "Failed to load services",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        const [serviceRes, staffRes] = await Promise.all([
          fetch(`/api/public/services/${serviceId}`),
          fetch(`/api/public/staff?serviceId=${serviceId}`),
        ])

        if (serviceRes.ok) {
          const serviceData = await serviceRes.json()
          setService(serviceData)
        } else {
          throw new Error("Failed to fetch service")
        }

        if (staffRes.ok) {
          const staffData = await staffRes.json()
          setStaffMembers(staffData)
        } else {
          throw new Error("Failed to fetch staff")
        }
      } catch (error) {
        console.error("Failed to fetch data", error)
        toast({
          title: "Error",
          description: "Failed to load service information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServiceData()
  }, [serviceId, toast])

  // Fetch staff availability when date/time changes
  useEffect(() => {
    const fetchStaffAvailability = async () => {
      if (!watchDate || !watchTime || !service) return

      try {
        const res = await fetch(`/api/public/availability?date=${watchDate}&time=${watchTime}&serviceId=${service.id}`)
        if (res.ok) {
          const data = await res.json()
          setAvailableStaff(data.availableStaff)
          setStaffAvailability(data.availability)
        }
      } catch (error) {
        console.error("Failed to fetch availability", error)
      }
    }

    fetchStaffAvailability()
  }, [watchDate, watchTime, service])

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
      }

      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (res.ok) {
        toast({
          title: "Booking Confirmed",
          description: "Your appointment has been successfully booked!",
        })
        setBookingSuccess(true)
        reset()
        setTimeout(() => setBookingSuccess(false), 3000)
      } else {
        throw new Error('Booking failed')
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive"
      })
    }
  }

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

  // Function to check if staff is available for selected time
  const isStaffAvailable = (staffId: number) => {
    return availableStaff.some(staff => staff.id === staffId)
  }

  if (loading) {
    return <BookPageLoading />
  }

  if (!serviceId) {
    return (
      <PublicLayout>
        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mb-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold md:text-5xl">Book Your Appointment</h1>
              <p className="mt-3 text-lg text-muted-foreground">Choose a service to get started</p>
            </motion.div>

            {serviceOptions.length === 0 ? (
              <div className="text-center">
                <p className="mb-6 text-muted-foreground">No services available right now.</p>
                <Button asChild>
                  <Link href="/services">Browse Services</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {serviceOptions.map((item) => (
                  <motion.div
                    key={item.id}
                    className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="relative h-44 w-full bg-muted">
                      <Image
                        src={getServiceImageUrl(item.image)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-col gap-3 p-5">
                      <h2 className="text-xl font-semibold">{item.name}</h2>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-primary">${item.price}</span>
                        <span className="text-muted-foreground">{item.durationMinutes} min</span>
                      </div>
                      <Button
                        className="w-full bg-primary text-white hover:bg-[#B2223A]"
                        onClick={() => router.push(`/book?service=${item.id}`)}
                      >
                        Book This Service
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </PublicLayout>
    )
  }

  if (!service) {
    return (
      <PublicLayout>
        <section className="py-12 md:py-20">
          <div className="container px-4 max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Service Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8">The service you're looking for doesn't exist.</p>
            <Button asChild>
              <a href="/services">Browse Services</a>
            </Button>
          </div>
        </section>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container px-4 max-w-4xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Appointment</h1>
            <p className="text-lg text-muted-foreground">Schedule your next beauty and wellness service</p>
            {isLoggedIn && userData && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Welcome back, {userData.name}!</strong> Your information has been pre-filled.
                </p>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Info Card */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="p-6 rounded-lg border bg-card sticky top-6">
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={getServiceImageUrl(service.image)}
                    alt={service.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <h2 className="text-2xl font-semibold mb-2">{service.name}</h2>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Rs {service.price}</span>
                  <span>{service.durationMinutes} minutes</span>
                </div>
              </div>
            </motion.div>

            {/* Booking Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-8 rounded-lg border bg-card">
                {bookingSuccess && (
                  <motion.div
                    className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="font-semibold">Booking Confirmed!</p>
                    <p className="text-sm">You will receive a confirmation email shortly.</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <Input 
                        {...register("date")} 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        className={errors.date ? "border-red-500" : ""} 
                      />
                      {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <select 
                        {...register("time")} 
                        className="w-full px-4 py-2 rounded-lg border bg-background"
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                      {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
                    </div>
                  </div>

                  {watchDate && watchTime && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Staff</label>
                      <select 
                        {...register("staffId")} 
                        className="w-full px-4 py-2 rounded-lg border bg-background"
                      >
                        <option value="">Select a staff member</option>
                        {staffMembers.map((staff) => {
                          const isAvailable = isStaffAvailable(staff.id)
                          const staffAvail = staffAvailability.find(a => a.staffId === staff.id)
                          
                          return (
                            <option 
                              key={staff.id} 
                              value={staff.id} 
                              disabled={!isAvailable}
                              className={!isAvailable ? 'text-gray-400' : ''}
                            >
                              {staff.name} 
                              {!isAvailable && staffAvail && (
                                ` (Available from ${staffAvail.startTime})`
                              )}
                              {!isAvailable && !staffAvail && (
                                ' (Not available)'
                              )}
                            </option>
                          )
                        })}
                      </select>
                      {errors.staffId && <p className="text-red-500 text-sm mt-1">{errors.staffId.message}</p>}
                      
                      {/* Show availability information */}
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setShowAvailabilityModal(true)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-900 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Show staff availability
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Customer Information - Only show for non-logged in users */}
                  {!isLoggedIn && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input 
                          {...register("name")} 
                          placeholder="John Doe" 
                          className={errors.name ? "border-red-500" : ""} 
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          {...register("email")}
                          type="email"
                          placeholder="your@email.com"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                      </div>
                    </>
                  )}

                  {/* Phone field - Always show */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      {...register("phone")}
                      placeholder="(555) 123-4567"
                      className={errors.phone ? "border-red-500" : ""}
                      defaultValue={userData?.phone || ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Confirm Booking
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>

        <InfoModal
          open={showAvailabilityModal}
          onClose={() => setShowAvailabilityModal(false)}
          title="Staff Availability"
          description={`Working hours for ${watchDate}`}
        >
          <div className="space-y-3">
            {staffMembers.map((staff) => {
              const avail = staffAvailability.find(a => a.staffId === staff.id)
              const isAvailable = isStaffAvailable(staff.id)
              
              return (
                <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
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
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isAvailable 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Staff availability is checked for your selected time slot and service duration.
            </p>
          </div>
        </InfoModal>
      </section>
    </PublicLayout>
  )
}