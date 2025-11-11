"use client"

import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getReferralByTrackingId,
  getContracts,
  getPantries,
  saveReferral,
  calculateBoxesNeeded,
} from "@/lib/data-service"
import type { Referral, Contract, Pantry } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, Send, XCircle, RefreshCcw, Pencil } from "lucide-react"
import { formatDate } from "@/lib/utils/date-helpers"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function ReferralDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [referral, setReferral] = useState<Referral | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [pantries, setPantries] = useState<Pantry[]>([])
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [reReferDialogOpen, setReReferDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    adults: 0,
    childrenUnder5: 0,
    children6to12: 0,
    children13to18: 0,
    dietaryRequirements: "",
    pantryId: 0,
  })

  useEffect(() => {
    const trackingId = params.id as string
    const referralData = getReferralByTrackingId(trackingId)

    if (referralData) {
      setReferral(referralData)
      setContracts(getContracts())
      setPantries(getPantries())
      setEditFormData({
        firstName: referralData.firstName,
        lastName: referralData.lastName,
        phone: referralData.phone,
        email: referralData.email || "",
        adults: referralData.familyComposition.adults,
        childrenUnder5: referralData.familyComposition.childrenUnder5,
        children6to12: referralData.familyComposition.children6to12,
        children13to18: referralData.familyComposition.children13to18,
        dietaryRequirements: referralData.dietaryRequirements || "",
        pantryId: referralData.pantryId,
      })
    }
  }, [params.id])

  const getCurrentCycle = () => {
    if (!referral?.cycles || referral.cycles.length === 0) return null
    return referral.cycles[referral.cycles.length - 1]
  }

  const handleCancelReferral = () => {
    if (!referral) return

    const currentCycle = getCurrentCycle()
    if (!currentCycle) return

    const updatedCycles = [...referral.cycles]
    updatedCycles[updatedCycles.length - 1] = {
      ...currentCycle,
      status: "cancelled",
    }

    const updatedReferral: Referral = {
      ...referral,
      cycles: updatedCycles,
    }

    saveReferral(updatedReferral)
    setReferral(updatedReferral)
    setCancelDialogOpen(false)

    toast({
      title: "Referral Cancelled",
      description: "The referral has been cancelled successfully.",
    })
  }

  const handleReRefer = () => {
    if (!referral) return

    const currentCycle = getCurrentCycle()
    if (!currentCycle) return

    const contract = contracts.find((c) => c.id === currentCycle.contractId)
    if (!contract) return

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + contract.cycleWeeks * 7)

    const newCycle = {
      contractId: currentCycle.contractId,
      pantryId: currentCycle.pantryId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "active" as const,
      currentWeek: 1,
    }

    const updatedReferral: Referral = {
      ...referral,
      cycles: [...referral.cycles, newCycle],
    }

    saveReferral(updatedReferral)
    setReferral(updatedReferral)
    setReReferDialogOpen(false)

    toast({
      title: "Re-referral Successful",
      description: `A new ${contract.cycleWeeks}-week cycle has been started.`,
    })
  }

  const handleCopyTrackingUrl = () => {
    if (referral) {
      navigator.clipboard.writeText(`${window.location.origin}${referral.trackingUrl}`)
      toast({
        title: "Copied!",
        description: "Tracking URL copied to clipboard.",
      })
    }
  }

  const handleResendSMS = () => {
    toast({
      title: "SMS Sent",
      description: `Welcome SMS sent to ${referral?.phone}`,
    })
  }

  const handleEditReferral = () => {
    if (!referral) return

    const totalHousehold =
      editFormData.adults + editFormData.childrenUnder5 + editFormData.children6to12 + editFormData.children13to18

    const updatedReferral: Referral = {
      ...referral,
      firstName: editFormData.firstName,
      lastName: editFormData.lastName,
      phone: editFormData.phone,
      email: editFormData.email || undefined,
      familyComposition: {
        adults: editFormData.adults,
        childrenUnder5: editFormData.childrenUnder5,
        children6to12: editFormData.children6to12,
        children13to18: editFormData.children13to18,
        totalHousehold,
      },
      dietaryRequirements: editFormData.dietaryRequirements || undefined,
      pantryId: editFormData.pantryId,
      updatedAt: new Date().toISOString(),
    }

    saveReferral(updatedReferral)
    setReferral(updatedReferral)
    setEditDialogOpen(false)

    toast({
      title: "Referral Updated",
      description: "The referral details have been updated successfully.",
    })
  }

  const formatFamilyComposition = () => {
    if (!referral?.familyComposition) {
      return "Family composition not available"
    }
    const { adults, childrenUnder5, children6to12, children13to18 } = referral.familyComposition
    const parts = []
    if (adults > 0) parts.push(`${adults} adult${adults > 1 ? "s" : ""}`)
    if (childrenUnder5 > 0) parts.push(`${childrenUnder5} child${childrenUnder5 > 1 ? "ren" : ""} (under 5)`)
    if (children6to12 > 0) parts.push(`${children6to12} child${children6to12 > 1 ? "ren" : ""} (6-12)`)
    if (children13to18 > 0) parts.push(`${children13to18} child${children13to18 > 1 ? "ren" : ""} (13-18)`)
    return parts.join(", ")
  }

  const getReferralStatus = () => {
    const cycle = getCurrentCycle()
    if (!cycle) return "inactive"
    if (cycle.status === "cancelled") return "cancelled"
    if (new Date() < new Date(cycle.startDate)) return "pending"
    if (new Date() > new Date(cycle.endDate)) return "completed"
    return "active"
  }

  if (!referral) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  const currentCycle = getCurrentCycle()
  const currentContract = currentCycle ? contracts.find((c) => c.id === currentCycle.contractId) : null
  const currentPantry = currentCycle ? pantries.find((p) => p.id === currentCycle.pantryId) : null
  const status = getReferralStatus()
  const eligiblePantries = currentContract
    ? pantries.filter((p) => currentContract.eligiblePantryIds?.includes(p.id))
    : []

  const boxesNeeded = calculateBoxesNeeded(referral.familyComposition.totalHousehold)

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
                  {referral.firstName} {referral.lastName}
                </CardTitle>
                <CardDescription>Created on {formatDate(referral.createdAt)}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={status === "active" ? "default" : status === "cancelled" ? "destructive" : "secondary"}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Referral Details</DialogTitle>
                      <DialogDescription>Update the referral information below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-firstName">First Name *</Label>
                          <Input
                            id="edit-firstName"
                            value={editFormData.firstName}
                            onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-lastName">Last Name *</Label>
                          <Input
                            id="edit-lastName"
                            value={editFormData.lastName}
                            onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">Phone Number *</Label>
                          <Input
                            id="edit-phone"
                            type="tel"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">Email (optional)</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Family Composition</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-adults" className="text-sm">
                              Adults (18+)
                            </Label>
                            <Input
                              id="edit-adults"
                              type="number"
                              min="0"
                              value={editFormData.adults}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, adults: Number.parseInt(e.target.value) || 0 })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-under5" className="text-sm">
                              Children Under 5
                            </Label>
                            <Input
                              id="edit-under5"
                              type="number"
                              min="0"
                              value={editFormData.childrenUnder5}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  childrenUnder5: Number.parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-6to12" className="text-sm">
                              Children 6-12
                            </Label>
                            <Input
                              id="edit-6to12"
                              type="number"
                              min="0"
                              value={editFormData.children6to12}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  children6to12: Number.parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-13to18" className="text-sm">
                              Children 13-18
                            </Label>
                            <Input
                              id="edit-13to18"
                              type="number"
                              min="0"
                              value={editFormData.children13to18}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  children13to18: Number.parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total household:{" "}
                          {editFormData.adults +
                            editFormData.childrenUnder5 +
                            editFormData.children6to12 +
                            editFormData.children13to18}{" "}
                          people
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-dietary">Dietary Requirements (optional)</Label>
                        <Input
                          id="edit-dietary"
                          value={editFormData.dietaryRequirements}
                          onChange={(e) => setEditFormData({ ...editFormData, dietaryRequirements: e.target.value })}
                          placeholder="e.g., Vegetarian, Gluten-free, Halal"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-pantry">Pantry *</Label>
                        <Select
                          value={editFormData.pantryId.toString()}
                          onValueChange={(value) => setEditFormData({ ...editFormData, pantryId: Number(value) })}
                        >
                          <SelectTrigger id="edit-pantry">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {eligiblePantries.length > 0 ? (
                              eligiblePantries.map((pantry) => (
                                <SelectItem key={pantry.id} value={pantry.id.toString()}>
                                  {pantry.name} - {pantry.address}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="0" disabled>
                                No eligible pantries available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleEditReferral}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{referral.phone}</p>
              </div>
              {referral.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{referral.email}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Family Composition</p>
              <p className="font-medium">{formatFamilyComposition()}</p>
              {referral.familyComposition && (
                <p className="text-sm text-muted-foreground mt-1">
                  Total household: {referral.familyComposition.totalHousehold} people
                </p>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">
                Collects <span className="text-lg font-bold">{boxesNeeded}</span> {boxesNeeded === 1 ? "box" : "boxes"}{" "}
                per week
              </p>
              <p className="text-xs text-blue-700 mt-1">Each box serves 4 people</p>
            </div>
            {referral.dietaryRequirements && (
              <div>
                <p className="text-sm text-muted-foreground">Dietary Requirements</p>
                <p className="font-medium">{referral.dietaryRequirements}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              {status === "active" && (
                <Dialog open={cancelDialogOpen} onValueChange={setCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Referral
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Referral</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this referral? This will stop their current cycle immediately.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                        No, Keep Active
                      </Button>
                      <Button variant="destructive" onClick={handleCancelReferral}>
                        Yes, Cancel Referral
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={reReferDialogOpen} onValueChange={setReReferDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" onClick={() => setReReferDialogOpen(true)}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Re-refer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Re-refer User</DialogTitle>
                    <DialogDescription>
                      This will start a new {currentContract?.cycleWeeks || 8}-week cycle for {referral.firstName}{" "}
                      {referral.lastName} at the same pantry and contract.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReReferDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleReRefer}>Confirm Re-referral</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Programme Details */}
        {currentCycle && currentContract && currentPantry && (
          <Card>
            <CardHeader>
              <CardTitle>Current Programme Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Contract</p>
                <p className="font-medium">{currentContract.name}</p>
                <p className="text-sm text-muted-foreground">{currentContract.organization}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pantry</p>
                <p className="font-medium">{currentPantry.name}</p>
                <p className="text-sm text-muted-foreground">{currentPantry.address}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cycle Period</p>
                  <p className="font-medium">
                    {currentContract.cycleWeeks} week{currentContract.cycleWeeks > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(currentCycle.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDate(currentCycle.endDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}${referral.trackingUrl}`}
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

        {/* All Cycles History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>All cycles for this referral</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Pantry</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referral.cycles && referral.cycles.length > 0 ? (
                  referral.cycles.map((cycle, index) => {
                    const contract = contracts.find((c) => c.id === cycle.contractId)
                    const pantry = pantries.find((p) => p.id === cycle.pantryId)
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">Cycle {index + 1}</TableCell>
                        <TableCell>{contract?.name || "Unknown"}</TableCell>
                        <TableCell>{pantry?.name || "Unknown"}</TableCell>
                        <TableCell>
                          {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                        </TableCell>
                        <TableCell>
                          {cycle.status === "active" && <Badge variant="default">Active</Badge>}
                          {cycle.status === "completed" && <Badge variant="secondary">Completed</Badge>}
                          {cycle.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No cycles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
