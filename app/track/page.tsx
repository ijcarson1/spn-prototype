"use client"

import { useEffect, useState } from "react"
import { getReferrals } from "@/lib/data-service"
import type { Referral } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TrackPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)

  useEffect(() => {
    const allReferrals = getReferrals()
    setReferrals(allReferrals)
  }, [])

  if (selectedReferral) {
    // Redirect to specific tracking page
    window.location.href = `/track/${selectedReferral.id}`
    return null
  }

  const getCurrentCycle = (referral: Referral) => {
    if (!referral.cycles || referral.cycles.length === 0) return null
    return referral.cycles[referral.cycles.length - 1]
  }

  const getReferralStatus = (referral: Referral) => {
    const currentCycle = getCurrentCycle(referral)
    if (!currentCycle) return "unknown"

    const now = new Date()
    const endDate = new Date(currentCycle.endDate)

    if (currentCycle.cancelled) return "cancelled"
    if (now > endDate) return "completed"
    return "active"
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">SPN - Tracking</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>End User Tracking</CardTitle>
            <CardDescription>
              Select a referral to view their tracking page (simulates accessing via SMS link)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {referrals
                .filter((r) => getReferralStatus(r) === "active")
                .slice(0, 10)
                .map((referral) => {
                  const currentCycle = getCurrentCycle(referral)
                  return (
                    <Button
                      key={referral.id}
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setSelectedReferral(referral)}
                    >
                      {referral.firstName} {referral.lastName}
                      {currentCycle && ` - Active Referral`}
                    </Button>
                  )
                })}
              {referrals.filter((r) => getReferralStatus(r) === "active").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active referrals available for tracking
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
