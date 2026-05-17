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
  <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-[#fbf5ec]/95 shadow-[0_4px_24px_rgba(82,54,24,0.04)] backdrop-blur dark:bg-[#0d0b08]/95">
    <div className="mx-auto flex h-[112px] max-w-full items-center px-8 lg:px-16">
      {/* Logo */}
      <Link href="/" className="flex shrink-0 items-center">
        <Image
          src="/logo.png"
          alt="NS Salon & Bridal Logo"
          width={290}
          height={76}
          className="h-[66px] w-auto object-contain"
          priority
        />
      </Link>

      {/* Desktop Navigation + Actions */}
      <div className="ml-auto hidden h-full items-center md:flex">
        <div className="flex h-full items-center gap-12 xl:gap-16">
          <nav className="flex h-full items-center gap-12 xl:gap-16">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex h-full items-center text-[15px] font-semibold uppercase tracking-[0.32em] transition-colors ${
                  isActive(link.href)
                    ? "text-[#2e2118] dark:text-[#f8efe4]"
                    : "text-[#3f3026]/80 hover:text-primary dark:text-[#f3eadf]/75 dark:hover:text-primary"
                }`}
              >
                {link.label}

                {isActive(link.href) && (
                  <span className="absolute bottom-[32px] left-0 h-px w-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex h-full items-center gap-7">
            <div className="flex h-full items-center">
              <ThemeToggle />
            </div>

            {!loading && !isLoggedIn && (
              <div className="flex h-full items-center gap-6">
                <Link
                  href="/login"
                  className="flex h-full items-center text-[13px] font-semibold uppercase tracking-[0.22em] text-[#3f3026]/65 transition-colors hover:text-primary dark:text-[#f3eadf]/70 dark:hover:text-primary"
                >
                  Login
                </Link>

                <span className="h-4 w-px bg-primary/25" />

                <Link
                  href="/register"
                  className="flex h-full items-center text-[13px] font-semibold uppercase tracking-[0.22em] text-[#3f3026]/65 transition-colors hover:text-primary dark:text-[#f3eadf]/70 dark:hover:text-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {!loading && isLoggedIn && (
              <div className="relative flex h-full items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0 border-primary/30 bg-transparent text-primary hover:bg-primary/10"
                  aria-label="Account menu"
                  aria-expanded={accountMenuOpen}
                  onClick={() => setAccountMenuOpen((open) => !open)}
                >
                  {accountMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>

                {accountMenuOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40"
                      aria-label="Close menu"
                      onClick={() => setAccountMenuOpen(false)}
                    />

                    <div className="absolute right-0 top-[76px] z-50 w-52 rounded-xl border border-primary/20 bg-card py-1 shadow-xl">
                      <p className="truncate border-b border-primary/15 px-4 py-2 text-xs text-muted-foreground">
                        {user?.name}
                      </p>

                      {accountLinks.map((link) => {
                        const Icon = link.icon

                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10"
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
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-primary/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <Link
              href="/book"
              className="flex h-[52px] items-center justify-center rounded-md bg-primary px-9 text-[15px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_10px_24px_rgba(184,134,11,0.18)] transition-colors hover:bg-[#a8792b]"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="ml-auto h-11 w-11 border-primary/35 text-primary md:hidden"
        aria-label="Navigation menu"
        onClick={() => setMobileNavOpen((open) => !open)}
      >
        {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>

    {mobileNavOpen && (
      <div className="border-t border-primary/15 bg-[#fbf5ec] px-4 py-4 dark:bg-[#0d0b08] md:hidden">
        <nav className="mb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-widest ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={closeMenus}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-primary/15 pt-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          {!loading && !isLoggedIn && (
            <>
              <Button variant="outline" asChild>
                <Link href="/login" onClick={closeMenus}>
                  Login
                </Link>
              </Button>

              <Button className="bg-primary text-white hover:bg-[#a8792b]" asChild>
                <Link href="/register" onClick={closeMenus}>
                  Sign Up
                </Link>
              </Button>
            </>
          )}

          <Button className="bg-primary text-white hover:bg-[#a8792b]" asChild>
            <Link href="/book" onClick={closeMenus}>
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    )}
  </header>
)
}
