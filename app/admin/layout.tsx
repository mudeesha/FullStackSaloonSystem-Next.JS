"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/services", label: "Services" },
    { href: "/admin/appointments", label: "Appointments" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/availability", label: "Staff Availability" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/reviews", label: "Reviews" },
  ]

  const isActive = (path: string) => pathname === path

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
  
      toast({ title: "Success", description: data.message });
      router.push("/login");
    } catch (err) {
      toast({ title: "Error", description: "Logout failed", variant: "destructive" });
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed md:static w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">S</div>
            <span>Salon Admin</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors text-sm ${
                isActive(item.href)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Button variant="outline" className="w-full justify-start bg-transparent text-xs" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="destructive" className="w-full justify-start text-xs" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
          <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <ThemeToggle />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
