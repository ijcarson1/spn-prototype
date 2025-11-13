"use client"

import { useEffect, useState } from "react"
import { getReferrals, getPantries, calculateBoxesNeeded, saveReferral } from "@/lib/data-service"
import type { Referral, Pantry } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, CheckCircle, Clock } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function CoordinatorPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [pantry, setPantry] = useState<Pantry | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "family" | "time">("name")
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualEntryForm, setManualEntryForm] = useState({
    referralId: "",
    proxyName: "",
    collectionDate: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const { toast } = useToast()
  const [proxyName, setProxyName] = useState("")

  // For demo purposes, we'll use the first pantry coordinator (Tollcross)
  const coordinatorPantryId = 1
  const today = new Date()

  useEffect(() => {
    console.log("[v0] Coordinator page loading. Today is:", today.toDateString())
    const allReferrals = getReferrals()
    console.log("[v0] Total referrals loaded:", allReferrals.length)
    const pantries = getPantries()
    const myPantry = pantries.find((p) => p.id === coordinatorPantryId)

    // Filter referrals who have collections today at this pantry
    const todayStr = today.toISOString().split("T")[0]
    console.log("[v0] Looking for collections on:", todayStr)
    const todaysReferrals = allReferrals.filter((referral) => {
      const hasCollection =
        referral.pantryId === coordinatorPantryId &&
        referral.collections.some((c) => {
          console.log("[v0] Checking referral", referral.firstName, "collection date:", c.expectedDate, "vs", todayStr)
          return c.expectedDate === todayStr
        })
      return hasCollection
    })
    console.log("[v0] Found referrals with collections today:", todaysReferrals.length)

    setPantry(myPantry || null)
    setReferrals(todaysReferrals)
  }, [])

  const todayCollections = referrals
    .map((referral) => {
      const todayStr = today.toISOString().split("T")[0]
      const collection = referral.collections.find((c) => c.expectedDate === todayStr)
      return { referral, collection }
    })
    .filter((item) => item.collection)

  const collected = todayCollections.filter((item) => item.collection?.status === "collected").length
  const pending = todayCollections.filter((item) => item.collection?.status === "pending").length

  const handleMarkCollected = (referralId: string, collectionId: string, useProxy = false) => {
    const now = new Date().toISOString()
    const proxy = useProxy ? proxyName : undefined

    const referrals = getReferrals()
    const referral = referrals.find((r) => r.id === referralId)
    if (referral) {
      const collection = referral.collections.find((c) => c.id === collectionId)
      if (collection) {
        collection.status = "collected"
        collection.collectedAt = now
        collection.collectedBy = "Pantry Coordinator"
        if (proxy) {
          collection.proxyName = proxy
        }
        referral.collectionsCompleted++
        referral.updatedAt = now
        saveReferral(referral)
      }
    }

    // Refresh data
    const allReferrals = getReferrals()
    const todayStr = today.toISOString().split("T")[0]
    const todaysReferrals = allReferrals.filter((referral) => {
      return referral.pantryId === coordinatorPantryId && referral.collections.some((c) => c.expectedDate === todayStr)
    })
    setReferrals(todaysReferrals)
    setProxyName("")

    toast({
      title: "Collection marked",
      description: proxy ? `Collected by proxy: ${proxy}` : "Successfully marked as collected",
    })
  }

  const formatFamilySize = (referral: Referral) => {
    return referral.familyComposition?.totalHousehold || 0
  }

  // Filter and sort collections
  const filteredCollections = todayCollections
    .filter((item) => {
      if (!searchQuery) return true
      const fullName = `${item.referral.firstName} ${item.referral.lastName}`.toLowerCase()
      return fullName.includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return `${a.referral.firstName} ${a.referral.lastName}`.localeCompare(
          `${b.referral.firstName} ${b.referral.lastName}`,
        )
      } else if (sortBy === "family") {
        return formatFamilySize(b.referral) - formatFamilySize(a.referral)
      } else {
        // Sort by time (collected items at bottom)
        if (a.collection?.status === "collected" && b.collection?.status !== "collected") return 1
        if (a.collection?.status !== "collected" && b.collection?.status === "collected") return -1
        return 0
      }
    })

  const formatDate = (date: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const handleManualEntry = () => {
    const allReferrals = getReferrals()
    const referral = allReferrals.find((r) => r.id.toLowerCase() === manualEntryForm.referralId.toLowerCase())

    if (!referral) {
      toast({
        title: "Referral Not Found",
        description: "Please check the referral ID and try again.",
        variant: "destructive",
      })
      return
    }

    if (referral.pantryId !== coordinatorPantryId) {
      toast({
        title: "Wrong Pantry",
        description: "This referral is assigned to a different pantry.",
        variant: "destructive",
      })
      return
    }

    // Find current active cycle
    const activeCycle = referral.cycles.find((c) => c.status === "active")
    if (!activeCycle) {
      toast({
        title: "No Active Cycle",
        description: "This referral does not have an active cycle.",
        variant: "destructive",
      })
      return
    }

    // Create manual collection entry
    const newCollection = {
      id: `${referral.id}-manual-${Date.now()}`,
      referralId: referral.id,
      weekNumber: referral.collections.length + 1,
      expectedDate: manualEntryForm.collectionDate,
      status: "collected" as const,
      collectedAt: new Date().toISOString(),
      collectedBy: "Pantry Coordinator (Manual Entry)",
      proxyName: manualEntryForm.proxyName || undefined,
      pantryId: coordinatorPantryId,
      contractId: activeCycle.contractId,
      notes: manualEntryForm.notes || undefined,
      manualEntry: true,
    }

    referral.collections.push(newCollection)
    referral.collectionsCompleted++
    saveReferral(referral)

    // Reset form and refresh data
    setManualEntryForm({
      referralId: "",
      proxyName: "",
      collectionDate: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setShowManualEntry(false)

    const todayStr = today.toISOString().split("T")[0]
    const todaysReferrals = getReferrals().filter((r) => {
      return r.pantryId === coordinatorPantryId && r.collections.some((c) => c.expectedDate === todayStr)
    })
    setReferrals(todaysReferrals)

    toast({
      title: "Collection Added",
      description: `Manual collection entry added for ${referral.firstName} ${referral.lastName}`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Today's Collections</h1>
          <p className="text-muted-foreground mt-1">{formatDate(today)}</p>
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
            <CardDescription>Mark collections as completed (name-based by default, QR optional)</CardDescription>
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
                filteredCollections.map(({ referral, collection }) => (
                  <Card key={referral.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {referral.firstName} {referral.lastName}
                            </h3>
                            {collection?.status === "collected" && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Collected
                                {collection.proxyName && ` (by ${collection.proxyName})`}
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
                            <span className="font-medium">
                              {calculateBoxesNeeded(formatFamilySize(referral))}{" "}
                              {calculateBoxesNeeded(formatFamilySize(referral)) === 1 ? "box" : "boxes"}
                            </span>
                            <span>Family size: {formatFamilySize(referral)}</span>
                            <span>Week {collection?.weekNumber} of 8</span>
                            {collection?.collectedAt && <span>{formatTime(collection.collectedAt)}</span>}
                          </div>
                        </div>
                        {collection?.status === "pending" && (
                          <div className="flex gap-2 items-center">
                            <Input
                              placeholder="Proxy name (optional)"
                              value={proxyName}
                              onChange={(e) => setProxyName(e.target.value)}
                              className="w-40"
                            />
                            <Button
                              onClick={() => handleMarkCollected(referral.id, collection.id, !!proxyName)}
                              size="sm"
                            >
                              Mark Collected
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="pt-4 border-t">
              <Button onClick={() => setShowManualEntry(!showManualEntry)} variant="outline" className="w-full">
                {showManualEntry ? "Hide" : "Add Manual Collection Entry"}
              </Button>

              {showManualEntry && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Manual Collection Entry</CardTitle>
                    <CardDescription>Add a collection for a specific referral and date</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-referral-id">Referral ID *</Label>
                      <Input
                        id="manual-referral-id"
                        placeholder="Enter referral tracking ID..."
                        value={manualEntryForm.referralId}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, referralId: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manual-date">Collection Date *</Label>
                      <Input
                        id="manual-date"
                        type="date"
                        value={manualEntryForm.collectionDate}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, collectionDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manual-proxy">Proxy Name (if collected by someone else)</Label>
                      <Input
                        id="manual-proxy"
                        placeholder="e.g., Family member name..."
                        value={manualEntryForm.proxyName}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, proxyName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manual-notes">Notes (optional)</Label>
                      <Textarea
                        id="manual-notes"
                        placeholder="Add any notes about this collection..."
                        value={manualEntryForm.notes}
                        onChange={(e) => setManualEntryForm({ ...manualEntryForm, notes: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleManualEntry} className="flex-1">
                        Add Collection
                      </Button>
                      <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
