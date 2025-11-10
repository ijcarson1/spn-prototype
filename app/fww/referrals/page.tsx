"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleSwitcher } from "@/components/role-switcher"
import { getUsers, getContracts, getPantries } from "@/lib/data-service"
import type { User } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search } from "lucide-react"

export default function ReferralsListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const allUsers = getUsers()
    const myUsers = allUsers.filter((u) => u.fwwId === 1) // Default to Jane Smith
    setUsers(myUsers)
    setFilteredUsers(myUsers)
  }, [])

  useEffect(() => {
    let filtered = users

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredUsers(filtered)
  }, [statusFilter, searchQuery, users])

  const contracts = getContracts()
  const pantries = getPantries()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/fww")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">My Referrals</h1>
          </div>
          <RoleSwitcher />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Referrals</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} referrals
        </div>

        {/* Referrals List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => {
            const contract = contracts.find((c) => c.id === user.contractId)
            const pantry = pantries.find((p) => p.id === user.pantryId)
            const attendanceRate =
              user.currentWeek > 0 ? Math.round((user.collectionsCompleted / Math.min(user.currentWeek, 8)) * 100) : 0

            return (
              <Card key={user.id} className="hover:border-primary cursor-pointer transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <CardDescription>{contract?.name}</CardDescription>
                    </div>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status === "active" ? "Active" : "Completed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Collections</p>
                      <p className="font-medium">{user.collectionsCompleted}/8</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Week</p>
                      <p className="font-medium">{user.currentWeek} of 8</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Attendance</p>
                      <p className="font-medium">{attendanceRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pantry</p>
                      <p className="font-medium">{pantry?.name}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/fww/referrals/${user.id}`)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            )
          })}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No referrals found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
