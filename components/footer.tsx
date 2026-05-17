import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-16 md:py-24">
      <div className="container px-4">
        {/* CTA Section */}
        <div className="mb-16 text-center py-12 border-b border-border">
          <div className="flex justify-center mb-4">
            <div className="h-px w-12 bg-primary"></div>
            <div className="mx-3 text-primary text-lg">✦</div>
            <div className="h-px w-12 bg-primary"></div>
          </div>
          <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4">Ready to Transform?</h3>
          <p className="text-foreground/70 mb-6">Book your appointment today and experience the difference</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-serif text-xl font-bold">S</span>
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold">Salon</h4>
                <p className="text-xs text-primary">Luxury Beauty</p>
              </div>
            </div>
            <p className="text-sm text-foreground/60">Your premier destination for beauty and wellness services.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4 relative inline-block">
              Quick Links
              <div className="h-0.5 w-6 bg-primary absolute bottom-0 left-0"></div>
            </h3>
            <ul className="space-y-2 text-sm mt-6">
              <li>
                <Link href="/services" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1">
                  <span>›</span> Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1">
                  <span>›</span> About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1">
                  <span>›</span> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4 relative inline-block">
              Contact
              <div className="h-0.5 w-6 bg-primary absolute bottom-0 left-0"></div>
            </h3>
            <ul className="space-y-3 text-sm mt-6">
              <li className="flex items-center gap-3 text-foreground/70">
                <Phone className="w-4 h-4 text-primary" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <Mail className="w-4 h-4 text-primary" />
                info@salon.com
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <MapPin className="w-4 h-4 text-primary" />
                123 Beauty St, NY
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4 relative inline-block">
              Follow Us
              <div className="h-0.5 w-6 bg-primary absolute bottom-0 left-0"></div>
            </h3>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-foreground/60 flex items-center justify-center gap-2">
          <span>✦</span>
          <p>&copy; 2025 Salon Management. All rights reserved.</p>
          <span>✦</span>
        </div>
      </div>
    </footer>
  )
}
