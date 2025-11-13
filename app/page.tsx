"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { initializeData, getCurrentRole } from "@/lib/data-service"
import { Spinner } from "@/components/ui/spinner"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Initialize data on first load
    initializeData()

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
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">Scottish Pantry Network</h1>
        <div className="flex items-center justify-center gap-2">
          <Spinner className="h-5 w-5" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  )
}
