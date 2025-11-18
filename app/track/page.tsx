"use client"

import { useEffect, useState } from "react"
import { getReferrals } from "@/lib/data-service"
import type { Referral } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { ChevronRight, Smartphone } from 'lucide-react'

export default function TrackPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)

  useEffect(() => {
    const allReferrals = getReferrals()
    setReferrals(allReferrals)
  }, [])

  if (selectedReferral) {
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
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-xl bg-foreground flex items-center justify-center mb-6">
            <Smartphone className="h-5 w-5 text-background" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Track Your Collection</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Select your profile to view your collection schedule and status.
          </p>
        </div>

        <Card className="border border-border/50 shadow-lg overflow-hidden">
          <div className="divide-y divide-border/40">
            {referrals
              .filter((r) => getReferralStatus(r) === "active")
              .slice(0, 10)
              .map((referral) => {
                const currentCycle = getCurrentCycle(referral)
                return (
                  <button
                    key={referral.id}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-all duration-200 text-left group"
                    onClick={() => setSelectedReferral(referral)}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium text-sm">
                        {referral.firstName[0]}{referral.lastName[0]}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground text-sm">
                          {referral.firstName} {referral.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentCycle ? "Active Referral" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )
              })}
            {referrals.filter((r) => getReferralStatus(r) === "active").length === 0 && (
              <div className="p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No active referrals available for tracking
                </p>
              </div>
            )}
          </div>
        </Card>
        
        <p className="text-xs text-center text-muted-foreground/60">
          Secure tracking portal · Scottish Pantry Network
        </p>
      </div>
    </div>
  )
}
