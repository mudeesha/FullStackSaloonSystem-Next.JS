export const services = [
  {
    id: 1,
    name: "Haircut",
    description: "Professional haircut with styling",
    price: 45,
    duration: 30,
    category: "Hair",
    image: "/images/service-haircut.jpg",
  },
  {
    id: 2,
    name: "Hair Coloring",
    description: "Full hair coloring service",
    price: 85,
    duration: 90,
    category: "Hair",
    image: "/images/service-haircut.jpg",
  },
  {
    id: 3,
    name: "Manicure",
    description: "Professional manicure with polish",
    price: 35,
    duration: 45,
    category: "Nails",
    image: "/images/service-nails.jpg",
  },
  {
    id: 4,
    name: "Pedicure",
    description: "Professional pedicure with polish",
    price: 40,
    duration: 45,
    category: "Nails",
    image: "/images/service-nails.jpg",
  },
  {
    id: 5,
    name: "Facial",
    description: "Relaxing facial treatment",
    price: 65,
    duration: 60,
    category: "Skincare",
    image: "/images/service-massage.jpg",
  },
  {
    id: 6,
    name: "Massage",
    description: "Full body relaxation massage",
    price: 75,
    duration: 60,
    category: "Wellness",
    image: "/images/service-massage.jpg",
  },
]

export const teamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Lead Stylist",
    image: "/professional-woman-stylist.jpg",
    specialties: ["Hair Coloring", "Styling"],
  },
  {
    id: 2,
    name: "Emma Davis",
    role: "Nail Specialist",
    image: "/professional-woman-nail-technician.jpg",
    specialties: ["Manicure", "Pedicure"],
  },
  {
    id: 3,
    name: "Lisa Chen",
    role: "Esthetician",
    image: "/professional-woman-esthetician.jpg",
    specialties: ["Facial", "Skincare"],
  },
  {
    id: 4,
    name: "Maria Garcia",
    role: "Massage Therapist",
    image: "/professional-woman-massage-therapist.jpg",
    specialties: ["Massage", "Wellness"],
  },
]

export const testimonials = [
  {
    id: 1,
    name: "Jessica Smith",
    text: "Amazing experience! The staff is professional and friendly. Highly recommend!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Brown",
    text: "Great service and attention to detail. Will definitely come back.",
    rating: 5,
  },
  {
    id: 3,
    name: "Amanda Wilson",
    text: "Love the relaxing atmosphere and quality of service. Best salon in town!",
    rating: 5,
  },
]

export const mockAppointments = [
  {
    id: 1,
    serviceId: 1,
    serviceName: "Haircut",
    clientName: "John Doe",
    clientEmail: "john@example.com",
    date: "2024-10-20",
    time: "10:00",
    status: "confirmed",
    staffName: "Sarah Johnson",
  },
  {
    id: 2,
    serviceId: 3,
    serviceName: "Manicure",
    clientName: "Jane Smith",
    clientEmail: "jane@example.com",
    date: "2024-10-20",
    time: "14:00",
    status: "completed",
    staffName: "Emma Davis",
  },
  {
    id: 3,
    serviceId: 5,
    serviceName: "Facial",
    clientName: "Alice Johnson",
    clientEmail: "alice@example.com",
    date: "2024-10-21",
    time: "11:00",
    status: "pending",
    staffName: "Lisa Chen",
  },
]

export const mockStaff = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@salon.com",
    role: "Stylist",
    phone: "(555) 111-1111",
    specialties: ["Hair Coloring", "Styling"],
  },
  {
    id: 2,
    name: "Emma Davis",
    email: "emma@salon.com",
    role: "Nail Specialist",
    phone: "(555) 111-2222",
    specialties: ["Manicure", "Pedicure"],
  },
]

export const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "(555) 222-1111",
    role: "customer",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "(555) 222-2222",
    role: "customer",
    joinDate: "2024-02-20",
  },
]

export const mockPayments = [
  {
    id: 1,
    appointmentId: 1,
    amount: 45,
    status: "paid",
    date: "2024-10-20",
    method: "Credit Card",
  },
  {
    id: 2,
    appointmentId: 2,
    amount: 35,
    status: "paid",
    date: "2024-10-20",
    method: "Cash",
  },
  {
    id: 3,
    appointmentId: 3,
    amount: 65,
    status: "pending",
    date: "2024-10-21",
    method: "Credit Card",
  },
]

export const mockReviews = [
  {
    id: 1,
    appointmentId: 1,
    clientName: "John Doe",
    rating: 5,
    comment: "Excellent service!",
    date: "2024-10-20",
  },
  {
    id: 2,
    appointmentId: 2,
    clientName: "Jane Smith",
    rating: 4,
    comment: "Very good, would recommend",
    date: "2024-10-20",
  },
]

export const mockProducts = [
  {
    id: 1,
    name: "Premium Hair Serum",
    description: "Nourishing hair serum for silky smooth hair",
    price: 29.99,
    availability: "In Stock",
    mainImage: "/images/product-serum.jpg",
    images: [
      "/images/product-serum.jpg",
      "/images/product-serum-2.jpg",
      "/images/product-serum-3.jpg",
      "/images/product-serum-4.jpg",
    ],
    details:
      "Our premium hair serum is formulated with natural oils and vitamins to restore shine and smoothness. Perfect for all hair types.",
  },
  {
    id: 2,
    name: "Organic Face Mask",
    description: "Deep cleansing face mask with natural ingredients",
    price: 24.99,
    availability: "In Stock",
    mainImage: "/images/product-mask.jpg",
    images: [
      "/images/product-mask.jpg",
      "/images/product-mask-2.jpg",
      "/images/product-mask-3.jpg",
      "/images/product-mask-4.jpg",
    ],
    details:
      "Made with organic ingredients, this face mask deeply cleanses and rejuvenates your skin. Use 2-3 times per week for best results.",
  },
  {
    id: 3,
    name: "Luxury Nail Polish Set",
    description: "Set of 12 premium nail polish colors",
    price: 39.99,
    availability: "In Stock",
    mainImage: "/images/product-nails.jpg",
    images: [
      "/images/product-nails.jpg",
      "/images/product-nails-2.jpg",
      "/images/product-nails-3.jpg",
      "/images/product-nails-4.jpg",
    ],
    details:
      "A complete collection of 12 stunning nail polish colors. Long-lasting formula with vibrant colors that won't chip.",
  },
  {
    id: 4,
    name: "Relaxation Bath Bombs",
    description: "Set of 6 aromatherapy bath bombs",
    price: 34.99,
    availability: "Low Stock",
    mainImage: "/images/product-bath.jpg",
    images: [
      "/images/product-bath.jpg",
      "/images/product-bath-2.jpg",
      "/images/product-bath-3.jpg",
      "/images/product-bath-4.jpg",
    ],
    details:
      "Transform your bath into a spa experience with our aromatherapy bath bombs. Each set includes 6 different scents.",
  },
]
