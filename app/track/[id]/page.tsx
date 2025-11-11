"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getReferralById, getPantries, getContracts, calculateBoxesNeeded } from "@/lib/data-service"
import type { Referral, Pantry, Contract } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Calendar, Clock } from "lucide-react"

export default function TrackingPage() {
  const params = useParams()
  const [referral, setReferral] = useState<Referral | null>(null)
  const [pantry, setPantry] = useState<Pantry | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [collections, setCollections] = useState<any[]>([])

  useEffect(() => {
    const referralId = params.id as string
    console.log("[v0] Looking up referral with ID:", referralId)
    const referralData = getReferralById(referralId)
    console.log("[v0] Found referral:", referralData)

    if (referralData && referralData.cycles && referralData.cycles.length > 0) {
      setReferral(referralData)

      // Get current cycle
      const currentCycle = referralData.cycles[referralData.cycles.length - 1]

      const pantries = getPantries()
      const pantryData = pantries.find((p) => p.id === referralData.pantryId)
      setPantry(pantryData || null)

      const contracts = getContracts()
      const contractData = contracts.find((c) => c.id === currentCycle.contractId)
      setContract(contractData || null)

      if (contractData && pantryData) {
        const startDate = new Date(currentCycle.cycleStartDate)
        const cycleCollections = []

        for (let week = 1; week <= contractData.cycleWeeks; week++) {
          const collectionDate = new Date(startDate)
          collectionDate.setDate(collectionDate.getDate() + (week - 1) * 7)

          const isPast = collectionDate < new Date()
          const isCurrent = week === currentCycle.currentWeek

          cycleCollections.push({
            id: `${referralData.id}-week-${week}`,
            weekNumber: week,
            expectedDate: collectionDate.toISOString(),
            status: isPast ? (Math.random() > 0.2 ? "collected" : "no-show") : "pending",
          })
        }

        setCollections(cycleCollections)
      }
    }
  }, [params.id])

  if (!referral || !pantry || !contract) {
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

  const currentCycle = referral.cycles[referral.cycles.length - 1]
  const progress = ((currentCycle.currentWeek || 1) / contract.cycleWeeks) * 100
  const collectionsCompleted = collections.filter((c) => c.status === "collected").length
  const nextCollection = collections.find((c) => c.status === "pending")

  const boxesNeeded = calculateBoxesNeeded(referral.familyComposition.totalHousehold)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays === -1) return "Yesterday"
    if (diffDays > 1) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  const collectionDay = pantry.contractCollectionDays?.[contract.id]?.collectionDay || "Unknown"
  const collectionTime =
    pantry.operatingHours?.[collectionDay.toLowerCase()]?.open &&
    pantry.operatingHours?.[collectionDay.toLowerCase()]?.close
      ? `${pantry.operatingHours[collectionDay.toLowerCase()].open} - ${pantry.operatingHours[collectionDay.toLowerCase()].close}`
      : "Please contact pantry"

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Hi {referral.firstName}!</CardTitle>
            <CardDescription>Your meal collection programme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Week {currentCycle.currentWeek || 1} of {contract.cycleWeeks}
                </span>
                <span className="text-sm text-muted-foreground">
                  {collectionsCompleted} of {contract.cycleWeeks} completed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Next Collection */}
        {nextCollection && !currentCycle.cancelled && (
          <Card>
            <CardHeader>
              <CardTitle>Next Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-900">
                  You will collect <span className="text-lg font-bold">{boxesNeeded}</span>{" "}
                  {boxesNeeded === 1 ? "box" : "boxes"} (for {referral.familyComposition.totalHousehold}{" "}
                  {referral.familyComposition.totalHousehold === 1 ? "person" : "people"})
                </p>
              </div>

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
                  <p className="font-medium">{collectionTime}</p>
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
            <CardDescription>{collectionsCompleted} collections completed</CardDescription>
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
                {collections.map((collection) => (
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
              <p className="text-sm">Weekly reminders sent via SMS to {referral.phone}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
