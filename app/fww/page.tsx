"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleSwitcher } from "@/components/role-switcher"
import { getUsers, getFWWs } from "@/lib/data-service"
import type { User, FWW } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, CheckCircle, Clock } from "lucide-react"

export default function FWWDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [fww, setFww] = useState<FWW | null>(null)
  const router = useRouter()

  useEffect(() => {
    const allUsers = getUsers()
    const allFWWs = getFWWs()
    setUsers(allUsers.filter((u) => u.fwwId === 1)) // Default to Jane Smith
    setFww(allFWWs[0])
  }, [])

  const activeReferrals = users.filter((u) => u.status === "active")
  const completedReferrals = users.filter((u) => u.status === "completed")
  const recentReferrals = users.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">SPN - Family Wellbeing Worker</h1>
          <RoleSwitcher />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {fww?.name}</h2>
          <p className="text-muted-foreground">{fww?.organization}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeReferrals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReferrals.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => router.push("/fww/create-referral")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Referral
            </Button>
            <Button variant="outline" onClick={() => router.push("/fww/referrals")}>
              View All Referrals
            </Button>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>Your last 5 referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReferrals.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Week {user.currentWeek} of 8 • {user.collectionsCompleted} collections
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/fww/referrals/${user.id}`)}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
