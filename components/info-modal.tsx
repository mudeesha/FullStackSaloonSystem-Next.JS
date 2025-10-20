"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface InfoModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  closeLabel?: string
}

export function InfoModal({
  open,
  title,
  description,
  onClose,
  children,
  closeLabel = "Close",
}: InfoModalProps) {
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
            <Button onClick={onClose}>
              {closeLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}