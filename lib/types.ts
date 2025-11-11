// Type definitions for the Scottish Pantry Network

export interface PlatformUser {
  id: number
  name: string
  email: string
  role: "fww" | "coordinator" | "admin"
  organization: string
  assignedContractIds?: number[] // For FWW users - changed from assignedContracts
  assignedPantryIds?: number[] // For Coordinator users - changed from assignedPantries
  totalReferrals?: number // For FWW users
  activeReferrals?: number // For FWW users
}

export interface Contract {
  id: number
  name: string
  organization: string
  startDate: string
  endDate: string
  cycleWeeks: number // renamed from cycleLength for clarity
  frequency: string // e.g., "weekly"
  surveyUrl: string | null
  eligiblePantryIds: number[] // added for many-to-many relationship
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
  pantryId: number
  contractId: number
  notes?: string
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
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export type Role = "end-user" | "fww" | "coordinator" | "admin"
