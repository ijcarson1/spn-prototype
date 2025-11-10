"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getContracts, getPantries, saveUser } from "@/lib/data-service"
import type { User, Collection, FamilyComposition } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

export default function CreateReferralPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    adults: "1",
    childrenUnder5: "0",
    children6to12: "0",
    children13to18: "0",
    dietaryRequirements: "",
    address: "",
    contractId: "",
    pantryId: "",
    startDate: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const contracts = getContracts()
  const pantries = getPantries()

  const selectedContract = contracts.find((c) => c.id === Number(formData.contractId))
  const eligiblePantries = selectedContract
    ? pantries.filter((p) => selectedContract.eligiblePantries.includes(p.id))
    : []

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const totalHousehold =
    Number(formData.adults) +
    Number(formData.childrenUnder5) +
    Number(formData.children6to12) +
    Number(formData.children13to18)

  const validateStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return false
      }
      if (Number(formData.adults) < 1) {
        toast({
          title: "At least 1 adult required",
          description: "Family composition must include at least one adult.",
          variant: "destructive",
        })
        return false
      }
    } else if (step === 2) {
      if (!formData.contractId) {
        toast({
          title: "Contract required",
          description: "Please select a contract.",
          variant: "destructive",
        })
        return false
      }
    } else if (step === 3) {
      if (!formData.pantryId) {
        toast({
          title: "Pantry required",
          description: "Please select a pantry.",
          variant: "destructive",
        })
        return false
      }
    } else if (step === 4) {
      if (!formData.startDate) {
        toast({
          title: "Start date required",
          description: "Please select a start date.",
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleSubmit = () => {
    if (!validateStep()) return

    const trackingId = Math.random().toString(36).substring(2, 10)
    const startDate = new Date(formData.startDate)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 8 * 7)

    const familyComposition: FamilyComposition = {
      adults: Number(formData.adults),
      childrenUnder5: Number(formData.childrenUnder5),
      children6to12: Number(formData.children6to12),
      children13to18: Number(formData.children13to18),
      totalHousehold,
    }

    // Generate collections for 8 weeks
    const collections: Collection[] = []
    for (let week = 1; week <= 8; week++) {
      const collectionDate = new Date(startDate)
      collectionDate.setDate(collectionDate.getDate() + (week - 1) * 7)

      collections.push({
        id: `${trackingId}-w${week}`,
        userId: trackingId,
        weekNumber: week,
        expectedDate: collectionDate.toISOString().split("T")[0],
        status: "pending",
        pantryId: Number(formData.pantryId),
      })
    }

    const newUser: User = {
      id: trackingId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email || undefined,
      familyComposition,
      dietaryRequirements: formData.dietaryRequirements || undefined,
      address: formData.address || undefined,
      contractId: Number(formData.contractId),
      pantryId: Number(formData.pantryId),
      fwwId: 1, // Default to Jane Smith
      status: "active",
      cycleStartDate: startDate.toISOString().split("T")[0],
      cycleEndDate: endDate.toISOString().split("T")[0],
      currentWeek: 1,
      trackingUrl: `/track/${trackingId}`,
      collectionsCompleted: 0,
      collections,
      createdAt: new Date().toISOString(),
      createdBy: "Jane Smith",
    }

    saveUser(newUser)

    toast({
      title: "Referral created successfully!",
      description: `${newUser.firstName} ${newUser.lastName} has been added to the programme.`,
    })

    router.push(`/fww/referrals/${trackingId}`)
  }

  const selectedPantry = pantries.find((p) => p.id === Number(formData.pantryId))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push("/fww")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Create New Referral</h2>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  s === step
                    ? "bg-primary text-primary-foreground"
                    : s < step
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
            ))}
          </div>
          <div className="text-sm text-center text-muted-foreground">Step {step} of 5</div>
        </div>

        {/* Step 1: User Details with Family Composition */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Enter the user's personal and family information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="07123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-3 border-t pt-4">
                <Label className="text-base">Family Composition *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adults">Number of Adults *</Label>
                    <Input
                      id="adults"
                      type="number"
                      min="1"
                      value={formData.adults}
                      onChange={(e) => handleInputChange("adults", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childrenUnder5">Children Under 5</Label>
                    <Input
                      id="childrenUnder5"
                      type="number"
                      min="0"
                      value={formData.childrenUnder5}
                      onChange={(e) => handleInputChange("childrenUnder5", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="children6to12">Children 6-12</Label>
                    <Input
                      id="children6to12"
                      type="number"
                      min="0"
                      value={formData.children6to12}
                      onChange={(e) => handleInputChange("children6to12", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="children13to18">Children 13-18</Label>
                    <Input
                      id="children13to18"
                      type="number"
                      min="0"
                      value={formData.children13to18}
                      onChange={(e) => handleInputChange("children13to18", e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">Total household: {totalHousehold} people</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietaryRequirements">Dietary Requirements (optional)</Label>
                <Textarea
                  id="dietaryRequirements"
                  value={formData.dietaryRequirements}
                  onChange={(e) => handleInputChange("dietaryRequirements", e.target.value)}
                  placeholder="Enter any dietary requirements"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter address"
                />
              </div>

              <Button onClick={handleNext} className="w-full">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ... existing code for steps 2-4 ... */}

        {/* Step 2: Contract Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Contract Selection</CardTitle>
              <CardDescription>Select the programme contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract">Select Contract *</Label>
                <Select value={formData.contractId} onValueChange={(value) => handleInputChange("contractId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a contract" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedContract && (
                <div className="border rounded-lg p-4 space-y-2 bg-muted">
                  <h4 className="font-medium">Contract Details</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Organization:</span> {selectedContract.organization}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Cycle Length:</span> {selectedContract.cycleLength} weeks
                    </p>
                    <p>
                      <span className="text-muted-foreground">Collection Day:</span> {selectedContract.collectionDay}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Eligible Pantries:</span>{" "}
                      {selectedContract.eligiblePantries.length}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Pantry Selection */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Pantry Selection</CardTitle>
              <CardDescription>Choose the collection pantry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pantry">Select Pantry *</Label>
                <Select value={formData.pantryId} onValueChange={(value) => handleInputChange("pantryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pantry" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligiblePantries.map((pantry) => (
                      <SelectItem key={pantry.id} value={pantry.id.toString()}>
                        {pantry.name} - {pantry.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPantry && (
                <div className="border rounded-lg p-4 space-y-2 bg-muted">
                  <h4 className="font-medium">Pantry Details</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Address:</span> {selectedPantry.address}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Collection Day:</span> {selectedPantry.collectionDay}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Collection Time:</span> {selectedPantry.collectionTime}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Coordinator:</span> {selectedPantry.coordinator}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Cycle Dates */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Cycle Dates</CardTitle>
              <CardDescription>Set the programme start date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>

              {formData.startDate && (
                <div className="border rounded-lg p-4 space-y-2 bg-muted">
                  <h4 className="font-medium">Cycle Summary</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Start Date:</span>{" "}
                      {new Date(formData.startDate).toLocaleDateString("en-GB")}
                    </p>
                    <p>
                      <span className="text-muted-foreground">End Date:</span> {(() => {
                        const end = new Date(formData.startDate)
                        end.setDate(end.getDate() + 8 * 7)
                        return end.toLocaleDateString("en-GB")
                      })()}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Duration:</span> 8 weeks
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Please review all information before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">User Details</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>
                      Name: {formData.firstName} {formData.lastName}
                    </p>
                    <p>Phone: {formData.phone}</p>
                    {formData.email && <p>Email: {formData.email}</p>}
                    <p>Family Composition:</p>
                    <ul className="ml-4 list-disc">
                      <li>Adults: {formData.adults}</li>
                      <li>Children under 5: {formData.childrenUnder5}</li>
                      <li>Children 6-12: {formData.children6to12}</li>
                      <li>Children 13-18: {formData.children13to18}</li>
                      <li className="font-medium">Total household: {totalHousehold} people</li>
                    </ul>
                    {formData.dietaryRequirements && <p>Dietary Requirements: {formData.dietaryRequirements}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Programme Details</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Contract: {selectedContract?.name}</p>
                    <p>Pantry: {selectedPantry?.name}</p>
                    <p>Start Date: {new Date(formData.startDate).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  <Check className="mr-2 h-4 w-4" /> Submit Referral
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
