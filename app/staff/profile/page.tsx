"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  specialties: z.string().min(5, "Please list your specialties"),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function StaffProfilePage() {
  const { toast } = useToast()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Sarah Johnson",
      email: "sarah@salon.com",
      phone: "(555) 111-1111",
      specialties: "Hair Coloring, Styling",
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl font-bold mb-2">My Profile</h2>
        <p className="text-muted-foreground">Manage your professional information</p>
      </motion.div>

      <motion.div
        className="max-w-2xl p-8 rounded-lg border bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Profile Image</label>
            <ImageUpload onImageSelect={setProfileImage} label="Upload Profile Photo" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input {...register("name")} className={errors.name ? "border-red-500" : ""} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input {...register("email")} type="email" className={errors.email ? "border-red-500" : ""} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Specialties</label>
            <Textarea {...register("specialties")} rows={3} className={errors.specialties ? "border-red-500" : ""} />
            {errors.specialties && <p className="text-red-500 text-sm mt-1">{errors.specialties.message}</p>}
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </motion.div>
    </div>
  )
}
