"use client"

import { useEffect, useState } from "react"
import { getUsers, getPantries, updateCollection } from "@/lib/data-service"
import type { User, Pantry } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"

export default function CoordinatorPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pantry, setPantry] = useState<Pantry | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "family" | "time">("name")
  const { toast } = useToast()

  // For demo purposes, we'll use the first pantry coordinator (Tollcross)
  const coordinatorPantryId = 1
  const today = new Date()

  useEffect(() => {
    console.log("[v0] Coordinator page loading. Today is:", today.toDateString())
    const allUsers = getUsers()
    console.log("[v0] Total users loaded:", allUsers.length)
    const pantries = getPantries()
    const myPantry = pantries.find((p) => p.id === coordinatorPantryId)

    // Filter users who have collections today at this pantry
    const todayStr = today.toISOString().split("T")[0]
    console.log("[v0] Looking for collections on:", todayStr)
    const todaysUsers = allUsers.filter((user) => {
      const hasCollection =
        user.pantryId === coordinatorPantryId &&
        user.collections.some((c) => {
          console.log("[v0] Checking user", user.firstName, "collection date:", c.expectedDate, "vs", todayStr)
          return c.expectedDate === todayStr
        })
      return hasCollection
    })
    console.log("[v0] Found users with collections today:", todaysUsers.length)

    setPantry(myPantry || null)
    setUsers(todaysUsers)
  }, [])

  const todayCollections = users
    .map((user) => {
      const todayStr = today.toISOString().split("T")[0]
      const collection = user.collections.find((c) => c.expectedDate === todayStr)
      return { user, collection }
    })
    .filter((item) => item.collection)

  const collected = todayCollections.filter((item) => item.collection?.status === "collected").length
  const pending = todayCollections.filter((item) => item.collection?.status === "pending").length

  const handleMarkCollected = (userId: string, weekNumber: number) => {
    const now = new Date().toISOString()
    updateCollection(userId, weekNumber, "collected", now)

    // Refresh the data
    const allUsers = getUsers()
    const todayStr = today.toISOString().split("T")[0]
    const todaysUsers = allUsers.filter((user) => {
      return user.pantryId === coordinatorPantryId && user.collections.some((c) => c.expectedDate === todayStr)
    })
    setUsers(todaysUsers)

    toast({
      title: "Collection marked",
      description: "Successfully marked as collected",
    })
  }

  // Filter and sort collections
  const filteredCollections = todayCollections
    .filter((item) => {
      if (!searchQuery) return true
      const fullName = `${item.user.firstName} ${item.user.lastName}`.toLowerCase()
      return fullName.includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return `${a.user.firstName} ${a.user.lastName}`.localeCompare(`${b.user.firstName} ${b.user.lastName}`)
      } else if (sortBy === "family") {
        return b.user.familySize - a.user.familySize
      } else {
        // Sort by time (collected items at bottom)
        if (a.collection?.status === "collected" && b.collection?.status !== "collected") return 1
        if (a.collection?.status !== "collected" && b.collection?.status === "collected") return -1
        return 0
      }
    })

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Today's Collections</h1>
          <p className="text-muted-foreground mt-1">{format(today, "EEEE, d MMMM yyyy")}</p>
          <p className="text-lg font-medium mt-2">{pantry?.name}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Expected Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayCollections.length}</div>
              <p className="text-xs text-muted-foreground">collections scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{collected}</div>
              <p className="text-xs text-muted-foreground">marked as collected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pending}</div>
              <p className="text-xs text-muted-foreground">awaiting collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Sort */}
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Search and mark collections as completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant={sortBy === "name" ? "default" : "outline"} onClick={() => setSortBy("name")} size="sm">
                  Name
                </Button>
                <Button
                  variant={sortBy === "family" ? "default" : "outline"}
                  onClick={() => setSortBy("family")}
                  size="sm"
                >
                  Family Size
                </Button>
              </div>
            </div>

            {/* Collections List */}
            <div className="space-y-3">
              {filteredCollections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No collections match your search" : "No collections scheduled for today"}
                </div>
              ) : (
                filteredCollections.map(({ user, collection }) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            {collection?.status === "collected" && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Collected
                              </Badge>
                            )}
                            {collection?.status === "pending" && (
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Family size: {user.familySize}</span>
                            <span>Week {collection?.weekNumber} of 8</span>
                            {collection?.collectedAt && (
                              <span>{format(new Date(collection.collectedAt), "h:mm a")}</span>
                            )}
                          </div>
                        </div>
                        {collection?.status === "pending" && (
                          <Button onClick={() => handleMarkCollected(user.id, collection.weekNumber)} size="sm">
                            Mark Collected
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> At 11:59 PM, all pending collections will automatically be marked as no-shows and
              kits will be moved to pantry stock.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
