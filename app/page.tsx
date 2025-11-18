"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { initializeData, getCurrentRole } from "@/lib/data-service"
import { Spinner } from "@/components/ui/spinner"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Initialize data on first load
    initializeData()

    const timer = setTimeout(() => {
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
    }, 1500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-primary">S</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Scottish Pantry Network
          </h1>
          <p className="text-muted-foreground text-lg">
            Connecting communities with sustainable food solutions.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 animate-in slide-in-from-bottom-8 duration-1000 fade-in fill-mode-backwards delay-200">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner className="h-8 w-8 text-primary/50" />
            </div>
            <div className="h-12 w-12" /> {/* Spacer for spinner */}
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Initializing secure environment...
          </p>
        </div>
      </div>
    </div>
  )
}
