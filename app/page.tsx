"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { initializeData, getCurrentRole } from "@/lib/data-service"

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
      <div className="text-center">
        <h1 className="text-2xl font-bold">Scottish Pantry Network</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
