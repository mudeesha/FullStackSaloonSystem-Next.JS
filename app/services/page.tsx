"use client"

import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, DollarSign } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/search-bar"

type Service = {
  id: number
  name: string
  description: string
  price: number
  durationMinutes: number
  image?: string | null
}

export default function ServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [limit, setLimit] = useState(9)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch services from public API
  const fetchServices = async (page = 1, search = "") => {
    try {
      setLoading(true)
      const res = await fetch(`/api/public/services?page=${page}&limit=${limit}&search=${search}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch services")
      }
      
      if (data.data) {
        setServices(data.data)
        setTotalPages(data.pagination.totalPages)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Failed to fetch services", error)
      toast({
        title: "Error",
        description: "Failed to load services. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchServices(page, searchTerm)
    }
  }, [page, mounted])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
    if (mounted) {
      fetchServices(1, value)
    }
  }

  // Function to get correct image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "/placeholder.svg"
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath
    
    // If it starts with /uploads, it's a local file
    if (imagePath.startsWith('/uploads/')) return imagePath
    
    // Default fallback
    return "/placeholder.svg"
  }

  // Don't render search-related UI until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <PublicLayout>
        <section className="py-12 md:py-20">
          <div className="container px-4">
            {/* Static header without search until mounted */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Explore our comprehensive range of beauty and wellness services
              </p>
            </div>
            
            {/* Loading Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <div className="p-6">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-4 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </PublicLayout>
    )
  }

  if (loading) {
    return (
      <PublicLayout>
        <section className="py-12 md:py-20">
          <div className="container px-4">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 gap-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Explore our comprehensive range of beauty and wellness services
                </p>
              </div>
              <div className="flex-shrink-0">
                <SearchBar onSearch={(value) => handleSearch(value)} placeholder="Search services..." />
              </div>
            </div>

            {/* Loading Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <div className="p-6">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-4 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <section className="py-12 md:py-20">
        <div className="container px-4">
          {/* Header with Search */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Explore our comprehensive range of beauty and wellness services
              </p>
            </motion.div>
            <div className="w-full max-w-sm">
              <SearchBar 
                onSearch={(value) => handleSearch(value)} 
                placeholder="Search services..." 
              />
            </div>
          </div>

          {/* Services Grid */}
          {services.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "No services found" : "No Services Available"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Check back later for our service offerings."
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("")
                    setPage(1)
                    fetchServices(1, "")
                  }}
                >
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Search Results Info */}
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 text-center"
                >
                  <p className="text-muted-foreground">
                    Found {services.length} service{services.length !== 1 ? 's' : ''} matching "{searchTerm}"
                  </p>
                </motion.div>
              )}

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    className="rounded-lg border bg-card hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    {/* Service Image */}
                    <div className="relative w-full h-48 bg-muted">
                      <Image
                        src={getImageUrl(service.image)}
                        alt={service.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg'
                        }}
                      />
                    </div>
                    
                    {/* Service Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                      <p className="text-muted-foreground mb-4 flex-grow">
                        {service.description || "Professional service with excellent results."}
                      </p>
                      
                      {/* Price and Duration */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-accent" />
                            <span className="font-semibold">Rs {service.price}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-accent" />
                            <span className="text-sm">{service.durationMinutes} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Book Now Button */}
                      <Button asChild className="w-full mt-auto">
                        <Link href={`/book?service=${service.id}`}>
                          Book Now
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination - Only show if there are multiple pages */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground mx-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
