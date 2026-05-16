// app/admin/services/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { FormModal } from "@/components/form-modal"
import { SearchBar } from "@/components/search-bar"

type StaffService = {
  id: number
  staffId: number
  staff: {
    id: number
    name: string
  }
}

type Service = {
  id: number
  name: string
  description: string
  price: number
  durationMinutes: number
  image?: string | null
  staff: StaffService[]
}

type StaffMember = {
  id: number
  name: string
}

export default function AdminServicesPage() {
  const { toast } = useToast()
  const [serviceList, setServiceList] = useState<Service[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: number }>({ open: false, id: 0 })
  const [formModal, setFormModal] = useState<{ open: boolean; type: "add" | "edit"; id?: number }>({
    open: false,
    type: "add",
  })
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    duration: "",
    image: null as File | null 
  })
  const [selectedStaff, setSelectedStaff] = useState<number[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [limit, setLimit] = useState(9)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch services from API
  const fetchServices = async (page = 1, search = "") => {
    try {
      const res = await fetch(`/api/services?page=${page}&limit=${limit}&search=${search}`)
      const data = await res.json()
      setServiceList(data.data)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Failed to fetch services", error)
      toast({ title: "Error", description: "Failed to fetch services." })
    }
  }

  // Fetch staff members for dropdown
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const res = await fetch('/api/users?role=STAFF')
        const data = await res.json()
        setStaffMembers(data.data ?? [])
      } catch (error) {
        console.error("Failed to fetch staff members", error)
      }
    }
    fetchStaffMembers()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
    fetchServices(1, value)
  }

  useEffect(() => {
    fetchServices(page, searchTerm)
  }, [page])

  // Delete service
  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/services?id=${id}`, { method: "DELETE" })
      toast({ title: "Service Deleted", description: "Service has been removed." })
      setConfirmModal({ open: false, id: 0 })
      fetchServices()
    } catch (error) {
      console.error("Delete failed", error)
      toast({ title: "Error", description: "Failed to delete service." })
    }
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Open Add Form
  const handleOpenAddForm = () => {
    setFormData({ name: "", description: "", price: "", duration: "", image: null })
    setImagePreview(null)
    setSelectedStaff([])
    setFormModal({ open: true, type: "add" })
  }

  // Open Edit Form
  const handleOpenEditForm = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.durationMinutes.toString(),
      image: null
    })
    setImagePreview(service.image || null)
    setSelectedStaff(service.staff.map(staffService => staffService.staffId))
    setFormModal({ open: true, type: "edit", id: service.id })
  }

  // Save (Add/Edit) service
  const handleSaveService = async () => {
    const formDataToSend = new FormData()
    formDataToSend.append("name", formData.name)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("price", formData.price)
    formDataToSend.append("durationMinutes", formData.duration)
    
    // Append staff IDs as array
    selectedStaff.forEach(staffId => {
      formDataToSend.append("staffIds", staffId.toString())
    })
    
    if (formData.image) {
      formDataToSend.append("image", formData.image)
    }
    
    if (formModal.type === "edit" && formModal.id) {
      formDataToSend.append("id", formModal.id.toString())
    }

    try {
      if (formModal.type === "add") {
        await fetch("/api/services", {
          method: "POST",
          body: formDataToSend,
        })
        toast({ title: "Service Added", description: "New service has been added successfully." })
      } else if (formModal.type === "edit" && formModal.id) {
        await fetch("/api/services", {
          method: "PUT",
          body: formDataToSend,
        })
        toast({ title: "Service Updated", description: "Service has been updated successfully." })
      }

      setFormModal({ open: false, type: "add" })
      fetchServices()
    } catch (error) {
      console.error("Save failed", error)
      toast({ title: "Error", description: "Failed to save service." })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Services</h2>
          <p className="text-muted-foreground">Manage salon services</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar onSearch={(value) => handleSearch(value)} />
          <Button onClick={handleOpenAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Service List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {serviceList.map((service) => (
          <div
            key={service.id}
            className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col h-full">
              {/* Top Section: Image + Price/Duration */}
              <div className="flex justify-between items-start p-4">
                {/* Left - Image */}
                <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border">
                  <img
                    src={service.image || "/placeholder.jpg"}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Right - Price & Duration */}
                <div className="flex flex-col items-end text-sm">
                  <div className="text-right mb-1">
                    <p className="text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-lg font-semibold text-primary">Rs {service.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="text-lg font-semibold">{service.durationMinutes} min</p>
                  </div>
                </div>
              </div>

              {/* Middle Section: Name */}
              <div className="px-4">
                <h3 className="text-lg font-semibold text-foreground truncate">{service.name}</h3>
              </div>

              {/* Description */}
              <div className="px-4 mt-2 flex-grow">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {service.description}
                </p>
              </div>

              {/* Assigned Staff */}
              <div className="px-4 mt-2">
                <p className="text-xs text-muted-foreground mb-1">Assigned Staff:</p>
                <div className="flex flex-wrap gap-1">
                  {service.staff.map((staffService) => (
                    <span 
                      key={staffService.id}
                      className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                    >
                      {staffService.staff.name}
                    </span>
                  ))}
                  {service.staff.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No staff assigned</span>
                  )}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-end gap-2 mt-5 border-t pt-4 px-4 pb-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-primary hover:text-white transition"
                  onClick={() => handleOpenEditForm(service)}
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="transition"
                  onClick={() => setConfirmModal({ open: true, id: service.id })}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={confirmModal.open}
        title="Delete Service?"
        description="Are you sure you want to delete this service? This action cannot be undone."
        actionLabel="Delete"
        isDestructive
        onConfirm={() => handleDelete(confirmModal.id)}
        onCancel={() => setConfirmModal({ open: false, id: 0 })}
      />

      {/* Add/Edit Service Form Modal */}
      <FormModal
        open={formModal.open}
        title={formModal.type === "add" ? "Add New Service" : "Edit Service"}
        description={formModal.type === "add" ? "Create a new salon service" : "Update service details"}
        onClose={() => setFormModal({ open: false, type: "add" })}
        onSubmit={handleSaveService}
        submitLabel={formModal.type === "add" ? "Add Service" : "Update Service"}
      >
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Service Image</label>
            <div className="flex items-center gap-4">
              {(imagePreview || formModal.type === "edit") && (
                <div className="w-20 h-20 border rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a service image (JPEG, PNG, etc.)
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hair Cut"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Service description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (Rs)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (min)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
              />
            </div>
          </div>

          {/* Staff Assignment */}
          <div>
            <label className="block text-sm font-medium mb-2">Assigned Staff</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {staffMembers.map((staff) => (
                <div key={staff.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`staff-${staff.id}`}
                    checked={selectedStaff.includes(staff.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStaff([...selectedStaff, staff.id])
                      } else {
                        setSelectedStaff(selectedStaff.filter(id => id !== staff.id))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`staff-${staff.id}`} className="text-sm">
                    {staff.name}
                  </label>
                </div>
              ))}
              {staffMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No staff members found
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select staff members who can perform this service
            </p>
          </div>
        </div>
      </FormModal>
    </div>
  )
}