// Type definitions for the Scottish Pantry Network

export interface Contract {
  id: number
  name: string
  organization: string
  startDate: string
  endDate: string
  cycleLength: number
  frequency: string
  collectionDay: string
  eligiblePantries: number[]
  surveyUrl: string | null
  active: boolean
  totalUsers: number
  activeUsers: number
}

export interface Pantry {
  id: number
  name: string
  address: string
  region: string
  collectionDay: string
  collectionTime: string
  coordinator: string
  active: boolean
  weeklyCapacity: number
}

export interface FWW {
  id: number
  name: string
  email: string
  organization: string
  assignedContracts: number[]
  totalReferrals: number
  activeReferrals: number
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
  userId: string
  weekNumber: number
  expectedDate: string
  status: "pending" | "collected" | "no-show"
  collectedAt?: string
  pantryId: number
  notes?: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  familyComposition: FamilyComposition
  dietaryRequirements?: string
  address?: string
  contractId: number
  pantryId: number
  fwwId: number
  status: "active" | "completed"
  cycleStartDate: string
  cycleEndDate: string
  currentWeek: number
  trackingUrl: string
  collectionsCompleted: number
  collections: Collection[]
  createdAt: string
  createdBy: string
}

export type Role = "end-user" | "fww" | "coordinator" | "admin"
