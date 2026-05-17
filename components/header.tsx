"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, LayoutDashboard, User } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"

export function Header() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { user, loading, logout, dashboardPath, profilePath, isLoggedIn } = useAuth()

  if (pathname.startsWith("/staff") || pathname.startsWith("/admin")) {
    return null
  }

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/services", label: "SERVICES" },
    { href: "/gallery", label: "GALLERY" },
    { href: "/contact", label: "CONTACT" },
  ]

  const accountLinks = isLoggedIn
    ? [
        { href: dashboardPath, label: "Dashboard", icon: LayoutDashboard },
        { href: profilePath, label: "Profile", icon: User },
      ]
    : []

  const closeMenus = () => {
    setMobileNavOpen(false)
    setAccountMenuOpen(false)
  }

  const handleLogout = async () => {
    closeMenus()
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="NS Salon & Bridal Logo"
            width={200}
            height={50}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Center Navigation */}
        <nav className="hidden items-center gap-12 absolute left-1/2 transform -translate-x-1/2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-medium tracking-widest transition-colors ${
                isActive(link.href) ? "text-primary border-b border-primary pb-1" : "text-foreground/70 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Auth + CTA */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!loading && !isLoggedIn && (
            <div className="hidden items-center gap-3 md:flex">
              <Button variant="ghost" asChild size="sm" className="text-foreground/70 hover:text-foreground text-xs font-medium">
                <Link href="/login">Login</Link>
              </Button>
              <span className="text-border">|</span>
              <Button variant="ghost" asChild size="sm" className="text-foreground/70 hover:text-foreground text-xs font-medium">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {!loading && isLoggedIn && (
            <div className="relative hidden md:block">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Account menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                {accountMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {accountMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    aria-label="Close menu"
                    onClick={() => setAccountMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-border bg-card py-1 shadow-lg">
                    <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground truncate">{user?.name}</p>
                    {accountLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent"
                          onClick={closeMenus}
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      )
                    })}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <Button className="hidden md:flex bg-primary hover:bg-accent text-white font-medium text-xs tracking-wide px-6" asChild>
            <Link href="/book">BOOK NOW</Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 md:hidden"
            aria-label="Navigation menu"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="space-y-2 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={closeMenus}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!loading && !isLoggedIn && (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Button variant="outline" asChild>
                <Link href="/login" onClick={closeMenus}>
                  Login
                </Link>
              </Button>
              <Button className="bg-primary hover:bg-accent text-white" asChild>
                <Link href="/register" onClick={closeMenus}>
                  Sign Up
                </Link>
              </Button>
              <Button className="bg-primary hover:bg-accent text-white" asChild>
                <Link href="/book" onClick={closeMenus}>
                  Book Now
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
