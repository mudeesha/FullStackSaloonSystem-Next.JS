"use client"

import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search } from "lucide-react"

type SearchBarProps = {
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ onSearch, placeholder = "Search...", className }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onSearch(val)
  }

  return (
    <div className={`relative w-full max-w-md ${className ?? ""}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  )
}
