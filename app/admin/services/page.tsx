"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { services } from "@/lib/mock-data"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { FormModal } from "@/components/form-modal"

export default function AdminServicesPage() {
  const { toast } = useToast()
  const [serviceList, setServiceList] = useState(services)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "delete" | "edit"; id: number }>({
    open: false,
    type: "delete",
    id: 0,
  })
  const [formModal, setFormModal] = useState<{ open: boolean; type: "add" | "edit"; id?: number }>({
    open: false,
    type: "add",
  })
  const [formData, setFormData] = useState({ name: "", description: "", category: "", price: "", duration: "" })

  const handleDelete = (id: number) => {
    setServiceList(serviceList.filter((s) => s.id !== id))
    toast({
      title: "Service Deleted",
      description: "Service has been removed.",
    })
    setConfirmModal({ open: false, type: "delete", id: 0 })
  }

  const handleOpenAddForm = () => {
    setFormData({ name: "", description: "", category: "", price: "", duration: "" })
    setFormModal({ open: true, type: "add" })
  }

  const handleOpenEditForm = (id: number) => {
    const service = serviceList.find((s) => s.id === id)
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price.toString(),
        duration: service.duration.toString(),
      })
      setFormModal({ open: true, type: "edit", id })
    }
  }

  const handleSaveService = () => {
    if (formModal.type === "add") {
      const newService = {
        id: Math.max(...serviceList.map((s) => s.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        duration: Number.parseInt(formData.duration),
      }
      setServiceList([...serviceList, newService])
      toast({
        title: "Service Added",
        description: "New service has been added successfully.",
      })
    } else {
      setServiceList(
        serviceList.map((s) =>
          s.id === formModal.id
            ? {
                ...s,
                name: formData.name,
                description: formData.description,
                category: formData.category,
                price: Number.parseFloat(formData.price),
                duration: Number.parseInt(formData.duration),
              }
            : s,
        ),
      )
      toast({
        title: "Service Updated",
        description: "Service has been updated successfully.",
      })
    }
    setFormModal({ open: false, type: "add" })
  }

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

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Services</h2>
            <p className="text-muted-foreground">Manage salon services</p>
          </div>
          <Button onClick={handleOpenAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {serviceList.map((service, index) => (
          <motion.div
            key={service.id}
            className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{service.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Category</p>
                    <p className="text-muted-foreground">{service.category}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Price</p>
                    <p className="text-muted-foreground">${service.price}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Duration</p>
                    <p className="text-muted-foreground">{service.duration} min</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => handleOpenEditForm(service.id)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmModal({ open: true, type: "delete", id: service.id })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <ConfirmationModal
        open={confirmModal.open}
        title="Delete Service?"
        description="Are you sure you want to delete this service? This action cannot be undone."
        actionLabel="Delete"
        isDestructive
        onConfirm={() => handleDelete(confirmModal.id)}
        onCancel={() => setConfirmModal({ open: false, type: "delete", id: 0 })}
      />

      <FormModal
        open={formModal.open}
        title={formModal.type === "add" ? "Add New Service" : "Edit Service"}
        description={formModal.type === "add" ? "Create a new salon service" : "Update service details"}
        onClose={() => setFormModal({ open: false, type: "add" })}
        onSubmit={handleSaveService}
        submitLabel={formModal.type === "add" ? "Add Service" : "Update Service"}
      >
        <div className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Hair"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
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
        </div>
      </FormModal>
    </div>
  )
}
