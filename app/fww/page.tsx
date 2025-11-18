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
    setUsers(allUsers.filter((u) => u.fwwId === 1))
    setFww(allFWWs[0])
  }, [])

  const activeReferrals = users.filter((u) => u.status === "active")
  const completedReferrals = users.filter((u) => u.status === "completed")
  const recentReferrals = users.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">Welcome back, {fww?.name?.split(' ')[0]}</h2>
              <p className="text-muted-foreground">{fww?.organization}</p>
            </div>
            <Button 
              onClick={() => router.push("/fww/create-referral")} 
              size="lg" 
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Referral
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground tracking-tight">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1.5">Lifetime referrals</p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground tracking-tight">{activeReferrals.length}</div>
              <p className="text-xs text-muted-foreground mt-1.5">Currently in cycle</p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground tracking-tight">{completedReferrals.length}</div>
              <p className="text-xs text-muted-foreground mt-1.5">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-sm font-medium hover:bg-muted" onClick={() => router.push("/fww/referrals")}>
              View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
          
          <Card className="border border-border/50 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/40">
              {recentReferrals.map((user) => (
                <button
                  key={user.id}
                  className="w-full group flex items-center justify-between p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer text-left"
                  onClick={() => router.push(`/fww/referrals/${user.id}`)}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium text-sm">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground group-hover:text-foreground/80 transition-colors text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Week {user.currentWeek} · {user.collectionsCompleted} collections
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
