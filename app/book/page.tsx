"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { services } from "@/lib/mock-data"
import { useState } from "react"

const bookingSchema = z.object({
  service: z.string().min(1, "Please select a service"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function BookPage() {
  const { toast } = useToast()
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const onSubmit = (data: BookingFormData) => {
    toast({
      title: "Booking Confirmed",
      description: "Your appointment has been successfully booked!",
    })
    setBookingSuccess(true)
    reset()
    setTimeout(() => setBookingSuccess(false), 3000)
  }

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container px-4 max-w-2xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Appointment</h1>
            <p className="text-lg text-muted-foreground">Schedule your next beauty and wellness service</p>
          </motion.div>

          <motion.div
            className="p-8 rounded-lg border bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
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
              <div>
                <label className="block text-sm font-medium mb-2">Service</label>
                <select {...register("service")} className="w-full px-4 py-2 rounded-lg border bg-background">
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id.toString()}>
                      {service.name} - ${service.price} ({service.duration} min)
                    </option>
                  ))}
                </select>
                {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input {...register("date")} type="date" className={errors.date ? "border-red-500" : ""} />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <select {...register("time")} className="w-full px-4 py-2 rounded-lg border bg-background">
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

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input {...register("name")} placeholder="John Doe" className={errors.name ? "border-red-500" : ""} />
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

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  {...register("phone")}
                  placeholder="(555) 123-4567"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <Button type="submit" className="w-full">
                Confirm Booking
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
