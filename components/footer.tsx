import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container px-4">
        {/* CTA Section */}
        <div className="py-16 md:py-24 text-center border-b border-border">
          <div className="flex justify-center mb-4">
            <div className="h-px w-12 bg-primary"></div>
            <div className="mx-3 text-primary text-lg">✦</div>
            <div className="h-px w-12 bg-primary"></div>
          </div>
          <h3 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-foreground">Ready to Transform?</h3>
          <p className="text-base md:text-lg text-foreground/70 mb-8">Book your appointment today and experience the difference</p>
          <div className="flex justify-center">
            <button className="bg-primary hover:bg-accent text-black font-medium px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2">
              📅 Book Your Appointment
            </button>
          </div>
        </div>

        <div className="py-16 md:py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center">
                <span className="text-primary font-serif text-2xl font-bold">S</span>
              </div>
            </div>
            <h4 className="font-serif text-2xl font-bold mb-2">Salon</h4>
            <p className="text-sm text-foreground/60 leading-relaxed">Your premier destination for beauty and wellness services.</p>
          </div>

          {/* Quick Links */}
          <div className="md:border-l border-border md:pl-8">
            <h3 className="font-serif font-bold text-xl mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/services" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary">›</span> Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary">›</span> About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary">›</span> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:border-l border-border md:pl-8">
            <h3 className="font-serif font-bold text-xl mb-6">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 text-foreground/70">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                info@salon.com
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                123 Beauty St, NY
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="md:border-l border-border md:pl-8">
            <h3 className="font-serif font-bold text-xl mb-6">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 pb-8 text-center text-sm text-foreground/60">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-primary">✦</span>
            <p>&copy; 2025 Salon Management. All rights reserved.</p>
            <span className="text-primary">✦</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
