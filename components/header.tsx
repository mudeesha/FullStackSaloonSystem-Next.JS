"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, LayoutDashboard, User } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

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
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">S</div>
          <span>Salon</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
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

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {!loading && !isLoggedIn && (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" asChild size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-primary text-white hover:bg-[#B2223A]" asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          {!loading && isLoggedIn && (
            <div className="relative">
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
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border bg-background py-1 shadow-lg">
                    <p className="border-b px-4 py-2 text-xs text-muted-foreground truncate">{user?.name}</p>
                    {accountLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent"
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
        <div className="border-t bg-background px-4 py-4 md:hidden">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                }`}
                onClick={closeMenus}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!loading && !isLoggedIn && (
            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/login" onClick={closeMenus}>
                  Login
                </Link>
              </Button>
              <Button className="flex-1 bg-primary text-white hover:bg-[#B2223A]" asChild>
                <Link href="/register" onClick={closeMenus}>
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
