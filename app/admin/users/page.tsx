"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { FormModal } from "@/components/form-modal"

type User = {
  id: number
  name: string
  email: string
  phone: string
  role: string
  joinDate: string
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: number }>({
    open: false,
    id: 0,
  })
  const [formModal, setFormModal] = useState<{ open: boolean; type: "add" | "edit"; id?: number }>({
    open: false,
    type: "add",
  })
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "customer" })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users", { credentials: "include" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load users")
      setUsers(data.data ?? [])
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load users",
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed")
      }
      fetchUsers()
      toast({ title: "User Deleted", description: "User has been removed." })
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to delete user.",
        variant: "destructive",
      })
    }
    setConfirmModal({ open: false, id: 0 })
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

  const handleSaveUser = async () => {
    try {
      if (formModal.type === "add") {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...formData,
            password: "ChangeMe123!",
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed")
        toast({ title: "User Added", description: "New user has been added successfully." })
      } else {
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: formModal.id, ...formData }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed")
        toast({ title: "User Updated", description: "User has been updated successfully." })
      }
      fetchUsers()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to save user.",
        variant: "destructive",
      })
    }
    setFormModal({ open: false, type: "add" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Users & Staff</h2>
          <p className="text-muted-foreground">Manage customers and staff members</p>
        </div>
        <Button onClick={handleOpenAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading users...</p>
      ) : users.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No users found. Add a customer or staff member to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <motion.div
              key={user.id}
              className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-4">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        user.role === "customer" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground md:grid-cols-4">
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <p>{user.phone || "—"}</p>
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
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenEditForm(user.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmModal({ open: true, id: user.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmationModal
        open={confirmModal.open}
        title="Delete User?"
        description="Are you sure you want to delete this user? This action cannot be undone."
        actionLabel="Delete"
        isDestructive
        onConfirm={() => handleDelete(confirmModal.id)}
        onCancel={() => setConfirmModal({ open: false, id: 0 })}
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
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2"
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
