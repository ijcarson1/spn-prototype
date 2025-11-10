"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { initializeData, getCurrentRole, migrateUsersToFamilyComposition, clearAllData } from "@/lib/data-service"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Initialize data on first load
    initializeData()
    migrateUsersToFamilyComposition()

    // Show debug panel briefly
    setShowDebug(true)
    const timer = setTimeout(() => {
      // Redirect based on current role
      const role = getCurrentRole()
      if (role === "end-user") {
        router.push("/track")
      } else if (role === "fww") {
        router.push("/fww")
      } else if (role === "coordinator") {
        router.push("/coordinator")
      } else {
        router.push("/admin")
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  const handleClearCache = () => {
    clearAllData()
    window.location.reload()
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Scottish Pantry Network</h1>
        <p className="text-muted-foreground">Loading...</p>
        {showDebug && (
          <div className="mt-8 p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Cache issues? Clear and refresh:</p>
            <Button onClick={handleClearCache} variant="outline" size="sm">
              Clear Cache & Reload
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
