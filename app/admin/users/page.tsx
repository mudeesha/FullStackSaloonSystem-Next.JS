"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockUsers, mockStaff } from "@/lib/mock-data"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { FormModal } from "@/components/form-modal"

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState([...mockUsers, ...mockStaff])
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "delete" | "edit"; id: number }>({
    open: false,
    type: "delete",
    id: 0,
  })
  const [formModal, setFormModal] = useState<{ open: boolean; type: "add" | "edit"; id?: number }>({
    open: false,
    type: "add",
  })
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "customer" })

  const handleDelete = (id: number) => {
    setUsers(users.filter((u) => u.id !== id))
    toast({
      title: "User Deleted",
      description: "User has been removed.",
    })
    setConfirmModal({ open: false, type: "delete", id: 0 })
  }

  const handleOpenAddForm = () => {
    setFormData({ name: "", email: "", phone: "", role: "customer" })
    setFormModal({ open: true, type: "add" })
  }

  const handleOpenEditForm = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      })
      setFormModal({ open: true, type: "edit", id })
    }
  }

  const handleSaveUser = () => {
    if (formModal.type === "add") {
      const newUser = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as "customer" | "staff",
        joinDate: new Date().toLocaleDateString(),
      }
      setUsers([...users, newUser])
      toast({
        title: "User Added",
        description: "New user has been added successfully.",
      })
    } else {
      setUsers(
        users.map((u) =>
          u.id === formModal.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role as "customer" | "staff",
              }
            : u,
        ),
      )
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
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
            <h2 className="text-3xl font-bold">Users & Staff</h2>
            <p className="text-muted-foreground">Manage customers and staff members</p>
          </div>
          <Button onClick={handleOpenAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      user.role === "customer" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p>{user.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Role</p>
                    <p className="capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Join Date</p>
                    <p>{user.joinDate}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => handleOpenEditForm(user.id)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmModal({ open: true, type: "delete", id: user.id })}
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
        title="Delete User?"
        description="Are you sure you want to delete this user? This action cannot be undone."
        actionLabel="Delete"
        isDestructive
        onConfirm={() => handleDelete(confirmModal.id)}
        onCancel={() => setConfirmModal({ open: false, type: "delete", id: 0 })}
      />

      <FormModal
        open={formModal.open}
        title={formModal.type === "add" ? "Add New User" : "Edit User"}
        description={formModal.type === "add" ? "Create a new user account" : "Update user details"}
        onClose={() => setFormModal({ open: false, type: "add" })}
        onSubmit={handleSaveUser}
        submitLabel={formModal.type === "add" ? "Add User" : "Update User"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
