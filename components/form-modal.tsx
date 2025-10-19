"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface FormModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
  submitLabel?: string
  cancelLabel?: string
  isLoading?: boolean
}

export function FormModal({
  open,
  title,
  description,
  onClose,
  onSubmit,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          {children}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {cancelLabel}
            </Button>
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? "Loading..." : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
