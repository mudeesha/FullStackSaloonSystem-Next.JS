"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  specialties: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function StaffProfilePage() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          reset({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
            specialties: data.user.specialties || "",
          })
        }
      })
      .catch(console.error)
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, phone: data.phone }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." })
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Profile</h2>
        <p className="text-muted-foreground">Manage your professional information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl p-8 rounded-lg border bg-card space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <Input {...register("name")} className={errors.name ? "border-red-500" : ""} />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input {...register("email")} type="email" disabled className="bg-muted" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <Input {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Specialties (assigned services)</label>
          <Textarea {...register("specialties")} rows={3} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground mt-1">Contact admin to update service assignments.</p>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  )
}
