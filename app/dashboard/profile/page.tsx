"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import Image from "next/image"
import { ImageUpload } from "@/components/image-upload"
import { getServiceImageUrl } from "@/lib/image-url"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { toast } = useToast()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const loadProfile = () => {
    fetch("/api/users/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          reset({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
          })
          setProfileImage(data.user.profileImage || null)
        }
      })
      .catch(console.error)
  }

  useEffect(() => {
    loadProfile()
  }, [reset])

  const uploadAvatar = async () => {
    if (!avatarFile) return null
    const formData = new FormData()
    formData.append("image", avatarFile)
    const res = await fetch("/api/users/profile/avatar", {
      method: "POST",
      credentials: "include",
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Upload failed")
    return data.profileImage as string
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setUploading(true)
      if (avatarFile) {
        const path = await uploadAvatar()
        if (path) setProfileImage(path)
        setAvatarFile(null)
        setPreviewUrl(null)
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: data.name, phone: data.phone }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." })
      loadProfile()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h2 className="mb-2 text-3xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Manage your account information and photo</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6 rounded-lg border bg-card p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border bg-muted">
            <Image
              src={previewUrl || getServiceImageUrl(profileImage) || "/profile-photo.jpg"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <ImageUpload
            label="Upload Profile Photo"
            currentImage={profileImage || "/profile-photo.jpg"}
            onImageSelect={(file) => {
              setAvatarFile(file)
              setPreviewUrl(URL.createObjectURL(file))
            }}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Full Name</label>
          <Input {...register("name")} className={errors.name ? "border-red-500" : ""} />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <Input {...register("email")} type="email" disabled className="bg-muted" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Phone</label>
          <Input {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
        </div>
        <Button type="submit" className="bg-primary text-white hover:bg-[#B2223A]" disabled={uploading}>
          {uploading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </motion.div>
  )
}
