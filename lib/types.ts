// Type definitions for the Scottish Pantry Network

export interface PlatformUser {
  id: number
  name: string
  email: string
  role: "fww" | "coordinator" | "admin"
  organization: string
  assignedContractIds?: number[] // For FWW users - auto-assigned all contracts by default
  assignedPantryIds?: number[] // For Coordinator users
  totalReferrals?: number // For FWW users
  activeReferrals?: number // For FWW users
}

// export interface Organization {
//   id: number
//   name: string
//   type: "nhs" | "council" | "charity" | "other"
//   region: string
//   contactName?: string
//   contactEmail?: string
//   active: boolean
// }

export interface Contract {
  id: number
  name: string
  organization: string // Kept as string field directly on contract, removed organizationId
  startDate: string
  endDate: string
  cycleWeeks: number
  frequency: string // e.g., "weekly"
  surveyUrl: string | null
  eligiblePantryIds: number[]
  active: boolean
  totalReferrals: number
  activeReferrals: number
}

export interface OperatingHours {
  open: string // e.g., "09:00"
  close: string // e.g., "17:00"
}

export interface ContractCollectionDay {
  contractId: number
  collectionDay: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
}

export interface Pantry {
  id: number
  name: string
  address: string
  region: string
  operatingHours: {
    [key in "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"]?: OperatingHours
  }
  contractCollectionDays: ContractCollectionDay[] // Which contracts this pantry serves and on what days
  coordinator: string
  active: boolean
}

export interface FamilyComposition {
  adults: number
  childrenUnder5: number
  children6to12: number
  children13to18: number
  totalHousehold: number
}

export interface Collection {
  id: string
  referralId: string
  weekNumber: number
  expectedDate: string
  status: "pending" | "collected" | "no-show"
  collectedAt?: string
  collectedBy?: string // added to track who marked it collected
  proxyName?: string // added to support proxy collection
  pantryId: number
  contractId: number
  notes?: string
  manualEntry?: boolean // added to flag manually added collections
}

export interface ReferralCycle {
  contractId: number
  cycleStartDate: string
  cycleEndDate: string
  currentWeek: number
  status: "active" | "completed" | "cancelled"
  cancelledAt?: string
  cancelReason?: string
}

export interface Referral {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  familyComposition: FamilyComposition
  dietaryRequirements?: string
  address?: string
  pantryId: number
  fwwId: number
  cycles: ReferralCycle[] // Support multiple active contracts and re-referrals
  trackingUrl: string
  collectionsCompleted: number
  collections: Collection[]
  accessibilityFlag?: boolean // added for delivery assessment
  fwwNotes?: string // added for FWW internal notes
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export type Role = "end-user" | "fww" | "coordinator" | "admin"
