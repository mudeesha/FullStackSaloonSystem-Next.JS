"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast({ title: "Login Failed", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: "Login Successful", description: `Welcome back, ${result.user.name}` })
      console.log(result);

      // Redirect based on role
      switch (result.user.role) {
        case "ADMIN":
          router.push("/admin/dashboard")
          break
        case "STAFF":
          router.push("/staff/dashboard")
          break
        default:
          router.push("/dashboard")
          break
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  return (
    <PublicLayout>
      <section className="py-12 md:py-20 min-h-[calc(100vh-200px)] flex items-center">
        <div className="container px-4 max-w-md mx-auto">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-accent hover:underline">
                  Register here
                </Link>
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <p className="text-muted-foreground">Customer: customer@example.com</p>
              <p className="text-muted-foreground">Staff: staff@example.com</p>
              <p className="text-muted-foreground">Admin: admin@example.com</p>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
