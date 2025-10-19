"use client"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search } from "lucide-react"

export function SearchBar({ onSearch }: { onSearch: (value: string) => void }) {
  const [query, setQuery] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onSearch(val)
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  )
}
