"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const isAuthenticated =
    pathname.startsWith("/dashboard") || pathname.startsWith("/staff") || pathname.startsWith("/admin")

  if (
    (!isAuthenticated && pathname.startsWith("/dashboard")) ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin")
  ) {
    return null
  }

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const getDashboardLink = () => {
    if (pathname.startsWith("/staff")) return "/staff/dashboard"
    if (pathname.startsWith("/admin")) return "/admin/dashboard"
    return "/dashboard"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">S</div>
          <span>Salon</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/profile-photo.jpg"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50">
                  <Link
                    href={getDashboardLink()}
                    className="block px-4 py-2 text-sm hover:bg-accent rounded-t-lg"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false)
                      // Handle logout
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-b-lg flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-primary hover:bg-[#B2223A] text-white" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-sm font-medium transition-colors ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" asChild className="flex-1">
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-primary hover:bg-[#B2223A] text-white flex-1" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
