"use client"

import { useEffect, useState } from "react"
import { RoleSwitcher } from "@/components/role-switcher"
import { getUsers } from "@/lib/data-service"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TrackPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const allUsers = getUsers()
    setUsers(allUsers)
  }, [])

  if (selectedUser) {
    // Redirect to specific tracking page
    window.location.href = `/track/${selectedUser.id}`
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">SPN - Tracking</h1>
          <RoleSwitcher />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>End User Tracking</CardTitle>
            <CardDescription>
              Select a user to view their tracking page (simulates accessing via SMS link)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {users
                .filter((u) => u.status === "active")
                .slice(0, 10)
                .map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.firstName} {user.lastName} - Week {user.currentWeek} of 8
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
