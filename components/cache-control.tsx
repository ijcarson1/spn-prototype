"use client"

import { Button } from "@/components/ui/button"
import { clearAllData } from "@/lib/data-service"
import { RotateCcw } from "lucide-react"

export function CacheControl() {
  const handleClearCache = () => {
    if (confirm("Clear all data and reload? This will reset to sample data.")) {
      clearAllData()
      window.location.reload()
    }
  }

  return (
    <Button onClick={handleClearCache} variant="ghost" size="sm" className="gap-2">
      <RotateCcw className="h-4 w-4" />
      Clear Cache
    </Button>
  )
}
