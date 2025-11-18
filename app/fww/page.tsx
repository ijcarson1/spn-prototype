"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { RoleSwitcher } from "@/components/role-switcher"
import { getUsers, getFWWs } from "@/lib/data-service"
import type { User, FWW } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, CheckCircle, Clock, ArrowRight, ChevronRight } from 'lucide-react'

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
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {fww?.name?.split(' ')[0]}</h2>
              <p className="text-muted-foreground text-lg">{fww?.organization}</p>
            </div>
            <Button onClick={() => router.push("/fww/create-referral")} size="lg" className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5">
              <Plus className="mr-2 h-5 w-5" />
              New Referral
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8 -mt-8">
        {/* Quick Stats - Floating Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime referrals</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{activeReferrals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently in cycle</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{completedReferrals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Referrals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-semibold tracking-tight">Recent Activity</h3>
            <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5" onClick={() => router.push("/fww/referrals")}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
            <div className="divide-y divide-border/50">
              {recentReferrals.map((user) => (
                <div 
                  key={user.id} 
                  className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/fww/referrals/${user.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Week {user.currentWeek} • {user.collectionsCompleted} collections
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
