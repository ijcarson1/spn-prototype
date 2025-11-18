"use client"

import { useEffect, useState } from "react"
import { getReferrals } from "@/lib/data-service"
import type { Referral } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, Smartphone } from 'lucide-react'

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Track Your Collection</h1>
          <p className="text-muted-foreground">
            Select your profile to view your collection schedule and status.
          </p>
        </div>

        <Card className="border-none shadow-xl shadow-black/5 overflow-hidden">
          <div className="divide-y divide-border/50">
            {referrals
              .filter((r) => getReferralStatus(r) === "active")
              .slice(0, 10)
              .map((referral) => {
                const currentCycle = getCurrentCycle(referral)
                return (
                  <button
                    key={referral.id}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left group"
                    onClick={() => setSelectedReferral(referral)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium text-sm">
                        {referral.firstName[0]}{referral.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {referral.firstName} {referral.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentCycle ? "Active Referral" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </button>
                )
              })}
            {referrals.filter((r) => getReferralStatus(r) === "active").length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No active referrals available for tracking
                </p>
              </div>
            )}
          </div>
        </Card>
        
        <p className="text-xs text-center text-muted-foreground/50">
          Secure tracking portal • Scottish Pantry Network
        </p>
      </div>
    </div>
  )
}
