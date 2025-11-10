"use client"

import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getUserByTrackingId, getContracts, getPantries } from "@/lib/data-service"
import type { User, Contract, Pantry } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, Send } from "lucide-react"
import { formatDate } from "@/lib/utils/date-helpers"

export default function ReferralDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [pantry, setPantry] = useState<Pantry | null>(null)

  useEffect(() => {
    const userId = params.id as string
    const userData = getUserByTrackingId(userId)

    if (userData) {
      setUser(userData)
      const contracts = getContracts()
      const pantries = getPantries()
      setContract(contracts.find((c) => c.id === userData.contractId) || null)
      setPantry(pantries.find((p) => p.id === userData.pantryId) || null)
    }
  }, [params.id])

  const handleCopyTrackingUrl = () => {
    if (user) {
      navigator.clipboard.writeText(`${window.location.origin}${user.trackingUrl}`)
      toast({
        title: "Copied!",
        description: "Tracking URL copied to clipboard.",
      })
    }
  }

  const handleResendSMS = () => {
    toast({
      title: "SMS Sent",
      description: `Welcome SMS sent to ${user?.phone}`,
    })
  }

  const formatFamilyComposition = () => {
    if (!user.familyComposition) {
      return "Family composition not available"
    }
    const { adults, childrenUnder5, children6to12, children13to18 } = user.familyComposition
    const parts = []
    if (adults > 0) parts.push(`${adults} adult${adults > 1 ? "s" : ""}`)
    if (childrenUnder5 > 0) parts.push(`${childrenUnder5} child${childrenUnder5 > 1 ? "ren" : ""} (under 5)`)
    if (children6to12 > 0) parts.push(`${children6to12} child${children6to12 > 1 ? "ren" : ""} (6-12)`)
    if (children13to18 > 0) parts.push(`${children13to18} child${children13to18 > 1 ? "ren" : ""} (13-18)`)
    return parts.join(", ")
  }

  if (!user || !contract || !pantry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push("/fww/referrals")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Referral Details</h2>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription>Created on {formatDate(user.createdAt)}</CardDescription>
              </div>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status === "active" ? "Active" : "Completed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              {user.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Family Composition</p>
              <p className="font-medium">{formatFamilyComposition()}</p>
              {user.familyComposition && (
                <p className="text-sm text-muted-foreground mt-1">
                  Total household: {user.familyComposition.totalHousehold} people
                </p>
              )}
            </div>
            {user.dietaryRequirements && (
              <div>
                <p className="text-sm text-muted-foreground">Dietary Requirements</p>
                <p className="font-medium">{user.dietaryRequirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Programme Details */}
        <Card>
          <CardHeader>
            <CardTitle>Programme Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Contract</p>
              <p className="font-medium">{contract.name}</p>
              <p className="text-sm text-muted-foreground">{contract.organization}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pantry</p>
              <p className="font-medium">{pantry.name}</p>
              <p className="text-sm text-muted-foreground">{pantry.address}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cycle</p>
                <p className="font-medium">Week {user.currentWeek} of 8</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collections</p>
                <p className="font-medium">{user.collectionsCompleted}/8</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="font-medium">
                  {user.currentWeek > 0
                    ? Math.round((user.collectionsCompleted / Math.min(user.currentWeek, 8)) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking URL */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tracking URL</p>
              <div className="flex gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}${user.trackingUrl}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={handleCopyTrackingUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={handleResendSMS} variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Resend Welcome SMS
            </Button>
          </CardContent>
        </Card>

        {/* Collection History */}
        <Card>
          <CardHeader>
            <CardTitle>Collection History</CardTitle>
            <CardDescription>{user.collectionsCompleted} of 8 collections completed</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collected At</TableHead>
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
                    <TableCell>
                      {collection.collectedAt ? new Date(collection.collectedAt).toLocaleString("en-GB") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
