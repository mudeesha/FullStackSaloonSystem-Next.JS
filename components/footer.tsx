import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, CalendarDays } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-primary/30 bg-[#fbf6ee] text-[#241711] dark:bg-[#0d0c0a] dark:text-[#f6ead9]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,132,51,0.12),transparent_48%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,214,139,0.08),transparent_50%)]" />
        <div className="absolute left-0 top-10 hidden text-[170px] leading-none text-primary/15 dark:text-primary/25 lg:block">
          ❦
        </div>
        <div className="absolute right-0 top-16 hidden scale-x-[-1] text-[170px] leading-none text-primary/15 dark:text-primary/25 lg:block">
          ❦
        </div>
        <div className="absolute right-0 bottom-0 hidden text-[190px] leading-none text-primary/10 dark:text-primary/20 lg:block">
          ❦
        </div>
      </div>

      {/* Footer content */}
      <footer className="relative z-10 py-14 md:py-20">
          <div className="mx-auto max-w-7xl rounded-b-3xl border-primary/20 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
              <div className="md:border-r md:border-primary/25 md:pr-10">
                <div className="mb-6 flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary text-primary">
                    <span className="font-serif text-6xl leading-none">S</span>
                  </div>
                  <h3 className="font-serif text-4xl font-bold text-foreground dark:text-[#f8efe4]">
                    Salon
                  </h3>
                </div>
                <div className="mb-6 flex items-center text-primary">
                  <div className="h-px w-16 bg-primary/40" />
                  <span className="mx-3">❧</span>
                  <div className="h-px w-16 bg-primary/40" />
                </div>
                <p className="text-lg leading-8 text-foreground/70 dark:text-[#f3eadf]/75">
                  Your premier destination for beauty and wellness services.
                </p>
              </div>

              <div className="md:border-r md:border-primary/25 md:px-10">
                <h4 className="mb-3 font-serif text-3xl font-bold text-foreground dark:text-[#f8efe4]">
                  Quick Links
                </h4>
                <div className="mb-7 h-px w-20 bg-primary/45" />
                <nav className="space-y-4 text-lg text-foreground/70 dark:text-[#f3eadf]/75">
                  <Link
                    href="/services"
                    className="flex items-center gap-3 transition-colors hover:text-primary"
                  >
                    <span className="text-primary">›</span> Services
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center gap-3 transition-colors hover:text-primary"
                  >
                    <span className="text-primary">›</span> About Us
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center gap-3 transition-colors hover:text-primary"
                  >
                    <span className="text-primary">›</span> Contact
                  </Link>
                </nav>
              </div>

              <div className="md:border-r md:border-primary/25 md:px-10">
                <h4 className="mb-3 font-serif text-3xl font-bold text-foreground dark:text-[#f8efe4]">
                  Contact
                </h4>
                <div className="mb-7 h-px w-20 bg-primary/45" />
                <div className="space-y-5 text-lg text-foreground/70 dark:text-[#f3eadf]/75">
                  <p className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" /> (+94) 77 449 5349
                  </p>
                  <p className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-primary" /> nssalonbatapola@gmail.com
                  </p>
                  <p className="flex items-center gap-4">
                    <MapPin className="h-6 w-6 text-primary" /> Manampita Road, Batapola 80320
                  </p>
                </div>
              </div>

              <div className="md:pl-10">
                <h4 className="mb-3 font-serif text-3xl font-bold text-foreground dark:text-[#f8efe4]">
                  Follow Us
                </h4>
                <div className="mb-7 h-px w-20 bg-primary/45" />
                <div className="flex gap-5">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary transition-all hover:bg-primary hover:text-white"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary transition-all hover:bg-primary hover:text-white"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary transition-all hover:bg-primary hover:text-white"
                  >
                    <Twitter className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-14 flex items-center justify-center text-primary/70">
              <div className="h-px flex-1 bg-primary/25" />
              <span className="mx-4 text-xl">❧</span>
              <div className="h-px flex-1 bg-primary/25" />
            </div>
            <p className="mt-8 text-center text-base text-foreground/70 dark:text-[#f3eadf]/75">
              © 2025 Mudeesha. All rights reserved.
            </p>
          </div>
        </footer>
    </footer>
  )
}