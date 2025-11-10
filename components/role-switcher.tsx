"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentRole, setCurrentRole } from "@/lib/data-service"

export function RoleSwitcher() {
  const [role, setRole] = useState<string>("admin")
  const router = useRouter()

  useEffect(() => {
    const currentRole = getCurrentRole()
    setRole(currentRole)
  }, [])

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    setCurrentRole(newRole)

    // Navigate to appropriate page
    if (newRole === "end-user") {
      router.push("/track")
    } else if (newRole === "fww") {
      router.push("/fww")
    } else if (newRole === "coordinator") {
      router.push("/coordinator")
    } else {
      router.push("/admin")
    }
  }

  return (
    <Select value={role} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="end-user">End User (Tracking)</SelectItem>
        <SelectItem value="fww">FWW</SelectItem>
        <SelectItem value="coordinator">Pantry Coordinator</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}
