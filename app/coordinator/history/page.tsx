"use client"

import { useEffect, useState } from "react"
import { getUsers, getPantries } from "@/lib/data-service"
import type { User, Pantry } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function CollectionHistoryPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pantry, setPantry] = useState<Pantry | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2025-11-05")) // Last Tuesday
  const [filter, setFilter] = useState<"all" | "collected" | "no-show">("all")

  const coordinatorPantryId = 1

  useEffect(() => {
    const allUsers = getUsers()
    const pantries = getPantries()
    const myPantry = pantries.find((p) => p.id === coordinatorPantryId)

    setPantry(myPantry || null)
    setUsers(allUsers.filter((u) => u.pantryId === coordinatorPantryId))
  }, [])

  const dateStr = selectedDate.toISOString().split("T")[0]
  const dayCollections = users
    .map((user) => {
      const collection = user.collections.find((c) => c.expectedDate === dateStr)
      return { user, collection }
    })
    .filter((item) => item.collection)

  const filteredCollections = dayCollections.filter((item) => {
    if (filter === "all") return true
    return item.collection?.status === filter
  })

  const collected = dayCollections.filter((item) => item.collection?.status === "collected").length
  const noShows = dayCollections.filter((item) => item.collection?.status === "no-show").length

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Collection History</h1>
            <p className="text-lg font-medium mt-2">{pantry?.name}</p>
          </div>
          <Link href="/coordinator">
            <Button variant="outline">Back to Today</Button>
          </Link>
        </div>

        {/* Date Picker and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>View past collection days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Show All</SelectItem>
                  <SelectItem value="collected">Collected Only</SelectItem>
                  <SelectItem value="no-show">No-shows Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Total:</div>
                <div className="text-2xl font-bold">{dayCollections.length}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Collected:</div>
                <div className="text-2xl font-bold text-green-600">{collected}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">No-shows:</div>
                <div className="text-2xl font-bold text-red-600">{noShows}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections List */}
        <Card>
          <CardHeader>
            <CardTitle>Collections for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredCollections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No collections found for this date</div>
              ) : (
                filteredCollections.map(({ user, collection }) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {user.firstName} {user.lastName}
                            </h3>
                            {collection?.status === "collected" && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Collected
                              </Badge>
                            )}
                            {collection?.status === "no-show" && (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                No-show
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Family size: {user.familySize}</span>
                            <span>Week {collection?.weekNumber} of 8</span>
                            {collection?.collectedAt && (
                              <span>Collected at {format(new Date(collection.collectedAt), "h:mm a")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
