"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getUserByTrackingId, getPantries, getContracts } from "@/lib/data-service"
import type { User, Pantry, Contract } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatRelativeDate, formatDate } from "@/lib/utils/date-helpers"
import { MapPin, Calendar, Clock } from "lucide-react"

export default function TrackingPage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [pantry, setPantry] = useState<Pantry | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)

  useEffect(() => {
    const trackingId = params.id as string
    const userData = getUserByTrackingId(trackingId)

    if (userData) {
      setUser(userData)
      const pantries = getPantries()
      const pantryData = pantries.find((p) => p.id === userData.pantryId)
      setPantry(pantryData || null)

      const contracts = getContracts()
      const contractData = contracts.find((c) => c.id === userData.contractId)
      setContract(contractData || null)
    }
  }, [params.id])

  if (!user || !pantry || !contract) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Tracking Not Found</CardTitle>
            <CardDescription>The tracking link you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const progress = (user.currentWeek / 8) * 100
  const nextCollection = user.collections.find((c) => c.status === "pending")

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Hi {user.firstName}!</CardTitle>
            <CardDescription>Your meal collection programme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Week {user.currentWeek} of 8</span>
                <span className="text-sm text-muted-foreground">{user.collectionsCompleted} of 8 completed</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Next Collection */}
        {nextCollection && user.status === "active" && (
          <Card>
            <CardHeader>
              <CardTitle>Next Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formatRelativeDate(nextCollection.expectedDate)}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(nextCollection.expectedDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{pantry.collectionTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{pantry.name}</p>
                  <p className="text-sm text-muted-foreground">{pantry.address}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pantry.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1 inline-block"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collection History */}
        <Card>
          <CardHeader>
            <CardTitle>Collection History</CardTitle>
            <CardDescription>{user.collectionsCompleted} collections completed</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">Week {collection.weekNumber}</TableCell>
                    <TableCell>{formatDate(collection.expectedDate)}</TableCell>
                    <TableCell>
                      {collection.status === "collected" && (
                        <Badge variant="default" className="bg-green-600">
                          Collected
                        </Badge>
                      )}
                      {collection.status === "no-show" && <Badge variant="destructive">No-show</Badge>}
                      {collection.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Program Info */}
        <Card>
          <CardHeader>
            <CardTitle>Programme Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Programme</p>
              <p className="text-sm">{contract.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p className="text-sm">{contract.organization}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notifications</p>
              <p className="text-sm">Weekly reminders sent via SMS to {user.phone}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
