// Data service for localStorage operations
import type { Contract, Pantry, PlatformUser, Referral, Collection, FamilyComposition, ReferralCycle } from "./types"

const DATA_VERSION = "2.4" // Bumped version to remove Organization concept

const STORAGE_KEYS = {
  contracts: "spn_contracts",
  pantries: "spn_pantries",
  referrals: "spn_referrals",
  platformUsers: "spn_platform_users",
  currentRole: "spn_currentRole",
  initialized: "spn_initialized",
  dataVersion: "spn_dataVersion",
}

// Initialize dummy data
export function initializeData() {
  if (typeof window === "undefined") return

  const currentVersion = localStorage.getItem(STORAGE_KEYS.dataVersion)
  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized)

  if (isInitialized && currentVersion === DATA_VERSION) {
    return
  }

  console.log("[v0] Initializing data with version", DATA_VERSION)

  const contracts: Contract[] = [
    {
      id: 1,
      name: "NHS Glasgow Individual Referral Program Q4 2025",
      organization: "NHS Glasgow", // Direct string, no organizationId
      startDate: "2025-10-01",
      endDate: "2026-03-31",
      cycleWeeks: 8,
      frequency: "weekly",
      surveyUrl: "https://typeform.com/nhs-survey",
      eligiblePantryIds: [1, 2, 3],
      active: true,
      totalReferrals: 45,
      activeReferrals: 38,
    },
    {
      id: 2,
      name: "Glasgow Council Family Support",
      organization: "Glasgow City Council", // Direct string, no organizationId
      startDate: "2025-09-15",
      endDate: "2026-02-28",
      cycleWeeks: 8,
      frequency: "weekly",
      surveyUrl: "https://surveymonkey.com/council-survey",
      eligiblePantryIds: [2, 3, 4],
      active: true,
      totalReferrals: 22,
      activeReferrals: 19,
    },
    {
      id: 3,
      name: "Edinburgh NHS Pilot",
      organization: "NHS Lothian", // Direct string, no organizationId
      startDate: "2025-11-01",
      endDate: "2026-04-30",
      cycleWeeks: 8,
      frequency: "weekly",
      surveyUrl: null,
      eligiblePantryIds: [5],
      active: true,
      totalReferrals: 8,
      activeReferrals: 8,
    },
  ]

  const pantries: Pantry[] = [
    {
      id: 1,
      name: "Tollcross Community Pantry",
      address: "42 Tollcross Road, Glasgow, G32 8AF",
      region: "East Glasgow",
      operatingHours: {
        tuesday: { open: "10:00", close: "16:00" },
        thursday: { open: "10:00", close: "15:00" },
      },
      contractCollectionDays: [{ contractId: 1, collectionDay: "tuesday" }],
      coordinator: "Sarah McDonald",
      active: true,
    },
    {
      id: 2,
      name: "Govan Community Hub",
      address: "15 Govan Road, Glasgow, G51 1JL",
      region: "South Glasgow",
      operatingHours: {
        tuesday: { open: "10:00", close: "16:00" },
        wednesday: { open: "10:00", close: "16:00" },
      },
      contractCollectionDays: [
        { contractId: 1, collectionDay: "tuesday" },
        { contractId: 2, collectionDay: "wednesday" },
      ],
      coordinator: "James Wilson",
      active: true,
    },
    {
      id: 3,
      name: "Maryhill Pantry",
      address: "88 Maryhill Road, Glasgow, G20 7QB",
      region: "North Glasgow",
      operatingHours: {
        tuesday: { open: "11:00", close: "15:00" },
        wednesday: { open: "11:00", close: "15:00" },
      },
      contractCollectionDays: [
        { contractId: 1, collectionDay: "tuesday" },
        { contractId: 2, collectionDay: "wednesday" },
      ],
      coordinator: "Emma Thompson",
      active: true,
    },
    {
      id: 4,
      name: "Drumchapel Food Hub",
      address: "120 Drumchapel Road, Glasgow, G15 6QE",
      region: "West Glasgow",
      operatingHours: {
        wednesday: { open: "10:00", close: "16:00" },
        friday: { open: "10:00", close: "14:00" },
      },
      contractCollectionDays: [{ contractId: 2, collectionDay: "wednesday" }],
      coordinator: "David Chen",
      active: true,
    },
    {
      id: 5,
      name: "Edinburgh Gorgie Pantry",
      address: "55 Gorgie Road, Edinburgh, EH11 2LA",
      region: "Edinburgh West",
      operatingHours: {
        thursday: { open: "10:00", close: "16:00" },
      },
      contractCollectionDays: [{ contractId: 3, collectionDay: "thursday" }],
      coordinator: "Linda Brown",
      active: true,
    },
  ]

  const platformUsers: PlatformUser[] = [
    // FWWs
    {
      id: 1,
      name: "Jane Smith",
      email: "jane.smith@nhs.scot",
      role: "fww",
      organization: "NHS Glasgow",
      assignedContractIds: [1, 2, 3], // Default to all contracts
      totalReferrals: 45,
      activeReferrals: 38,
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "michael.brown@glasgow.gov.uk",
      role: "fww",
      organization: "Glasgow City Council",
      assignedContractIds: [1, 2, 3], // Default to all contracts
      totalReferrals: 22,
      activeReferrals: 19,
    },
    {
      id: 3,
      name: "Aisha Khan",
      email: "aisha.khan@nhs.scot",
      role: "fww",
      organization: "NHS Lothian",
      assignedContractIds: [1, 2, 3], // Default to all contracts
      totalReferrals: 8,
      activeReferrals: 8,
    },
    // Coordinators
    {
      id: 4,
      name: "Sarah McDonald",
      email: "sarah.mcdonald@tollcross.org",
      role: "coordinator",
      organization: "Tollcross Community Pantry",
      assignedPantryIds: [1],
    },
    {
      id: 5,
      name: "James Wilson",
      email: "james.wilson@govan.org",
      role: "coordinator",
      organization: "Govan Community Hub",
      assignedPantryIds: [2],
    },
    // Admins
    {
      id: 6,
      name: "Admin User",
      email: "admin@spn.scot",
      role: "admin",
      organization: "Scottish Pantry Network",
    },
  ]

  const referrals: Referral[] = generateDummyReferrals()

  localStorage.setItem(STORAGE_KEYS.contracts, JSON.stringify(contracts))
  localStorage.setItem(STORAGE_KEYS.pantries, JSON.stringify(pantries))
  localStorage.setItem(STORAGE_KEYS.platformUsers, JSON.stringify(platformUsers))
  localStorage.setItem(STORAGE_KEYS.referrals, JSON.stringify(referrals))
  localStorage.setItem(STORAGE_KEYS.initialized, "true")
  localStorage.setItem(STORAGE_KEYS.dataVersion, DATA_VERSION)

  console.log("[v0] Data initialized successfully")
}

function generateDummyReferrals(): Referral[] {
  const firstNames = [
    "Emma",
    "James",
    "Sophie",
    "Oliver",
    "Isla",
    "Jack",
    "Amelia",
    "Harry",
    "Ava",
    "George",
    "Lucy",
    "Charlie",
    "Grace",
    "Liam",
    "Freya",
    "Noah",
    "Mia",
    "Ethan",
    "Ella",
    "Thomas",
  ]
  const lastNames = [
    "MacDonald",
    "Campbell",
    "Stewart",
    "Robertson",
    "Thomson",
    "Anderson",
    "Wilson",
    "Scott",
    "Murray",
    "Henderson",
    "Graham",
    "Walker",
    "Ross",
    "Morrison",
    "Watson",
    "Clark",
    "Mitchell",
    "Fraser",
    "Reid",
    "Young",
  ]

  const familyCompositions: FamilyComposition[] = [
    { adults: 1, childrenUnder5: 0, children6to12: 0, children13to18: 0, totalHousehold: 1 },
    { adults: 1, childrenUnder5: 1, children6to12: 0, children13to18: 0, totalHousehold: 2 },
    { adults: 2, childrenUnder5: 0, children6to12: 1, children13to18: 1, totalHousehold: 4 },
    { adults: 2, childrenUnder5: 2, children6to12: 1, children13to18: 0, totalHousehold: 5 },
    { adults: 1, childrenUnder5: 0, children6to12: 2, children13to18: 1, totalHousehold: 4 },
    { adults: 2, childrenUnder5: 0, children6to12: 0, children13to18: 0, totalHousehold: 2 },
    { adults: 1, childrenUnder5: 2, children6to12: 0, children13to18: 0, totalHousehold: 3 },
    { adults: 2, childrenUnder5: 1, children6to12: 2, children13to18: 0, totalHousehold: 5 },
  ]

  const referrals: Referral[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  console.log("[v0] Generating dummy referrals. Today is:", today.toDateString())

  // Generate 30 referrals with varied states
  for (let i = 0; i < 30; i++) {
    const trackingId = Math.random().toString(36).substring(2, 10)
    const familyComposition = familyCompositions[i % familyCompositions.length]

    // Determine contract, pantry assignment
    let contractId: number
    let pantryId: number
    let fwwId: number

    if (i < 15) {
      contractId = 1
      pantryId = [1, 2, 3][i % 3]
      fwwId = 1
    } else if (i < 25) {
      contractId = 2
      pantryId = [2, 3, 4][i % 3]
      fwwId = 2
    } else {
      contractId = 3
      pantryId = 5
      fwwId = 3
    }

    // Create referral cycles - some have single, some have multiple (including re-referrals)
    const cycles: ReferralCycle[] = []
    const collections: Collection[] = []

    if (i < 12) {
      // Active referrals at Pantry #1 for coordinator testing
      const weeksAgo = i % 6
      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() - weeksAgo * 7)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 8 * 7)

      cycles.push({
        contractId,
        cycleStartDate: startDate.toISOString().split("T")[0],
        cycleEndDate: endDate.toISOString().split("T")[0],
        currentWeek: weeksAgo + 1,
        status: "active",
      })

      // Generate collections for active cycle
      for (let week = 1; week <= weeksAgo + 1; week++) {
        const collectionDate = new Date(startDate)
        collectionDate.setDate(collectionDate.getDate() + (week - 1) * 7)
        const isToday = collectionDate.toDateString() === today.toDateString()
        const isPast = collectionDate < today

        let status: "pending" | "collected" | "no-show"
        let proxyName: string | undefined
        let notes: string | undefined

        if (isToday) {
          status = i < 6 ? "collected" : "pending"
          if (status === "collected" && i % 3 === 0) {
            proxyName = `${firstNames[(i + 5) % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`
          }
        } else if (isPast) {
          status = Math.random() < 0.8 ? "collected" : "no-show"
          if (status === "collected" && Math.random() < 0.2) {
            proxyName = `${firstNames[(i + 5) % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`
          }
          if (status === "no-show") {
            notes = "Did not attend scheduled collection"
          }
        } else {
          status = "pending"
        }

        collections.push({
          id: `${trackingId}-c${contractId}-w${week}`,
          referralId: trackingId,
          weekNumber: week,
          expectedDate: collectionDate.toISOString().split("T")[0],
          status,
          collectedAt: status === "collected" ? collectionDate.toISOString() : undefined,
          pantryId,
          contractId,
          proxyName,
          notes,
        })
      }
    } else if (i >= 12 && i < 15) {
      // Cancelled referrals for FWW testing
      const weeksAgo = 3
      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() - weeksAgo * 7)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 8 * 7)
      const cancelDate = new Date(startDate)
      cancelDate.setDate(cancelDate.getDate() + 2 * 7)

      cycles.push({
        contractId,
        cycleStartDate: startDate.toISOString().split("T")[0],
        cycleEndDate: endDate.toISOString().split("T")[0],
        currentWeek: 3,
        status: "cancelled",
        cancelledAt: cancelDate.toISOString(),
        cancelReason: "Circumstances improved",
      })

      // Generate collections up to cancellation
      for (let week = 1; week <= 2; week++) {
        const collectionDate = new Date(startDate)
        collectionDate.setDate(collectionDate.getDate() + (week - 1) * 7)

        collections.push({
          id: `${trackingId}-c${contractId}-w${week}`,
          referralId: trackingId,
          weekNumber: week,
          expectedDate: collectionDate.toISOString().split("T")[0],
          status: "collected",
          collectedAt: collectionDate.toISOString(),
          pantryId,
          contractId,
        })
      }
    } else if (i >= 15 && i < 17) {
      // Re-referred users (completed one cycle, now in second active cycle)
      const firstCycleStart = new Date(today)
      firstCycleStart.setDate(firstCycleStart.getDate() - 70) // 10 weeks ago
      const firstCycleEnd = new Date(firstCycleStart)
      firstCycleEnd.setDate(firstCycleEnd.getDate() + 8 * 7)

      cycles.push({
        contractId,
        cycleStartDate: firstCycleStart.toISOString().split("T")[0],
        cycleEndDate: firstCycleEnd.toISOString().split("T")[0],
        currentWeek: 8,
        status: "completed",
      })

      // Second active cycle
      const secondCycleStart = new Date(today)
      secondCycleStart.setDate(secondCycleStart.getDate() - 14) // 2 weeks ago
      const secondCycleEnd = new Date(secondCycleStart)
      secondCycleEnd.setDate(secondCycleEnd.getDate() + 8 * 7)

      cycles.push({
        contractId,
        cycleStartDate: secondCycleStart.toISOString().split("T")[0],
        cycleEndDate: secondCycleEnd.toISOString().split("T")[0],
        currentWeek: 3,
        status: "active",
      })

      // Generate collections for both cycles
      for (let week = 1; week <= 8; week++) {
        const collectionDate = new Date(firstCycleStart)
        collectionDate.setDate(collectionDate.getDate() + (week - 1) * 7)

        collections.push({
          id: `${trackingId}-c${contractId}-cycle1-w${week}`,
          referralId: trackingId,
          weekNumber: week,
          expectedDate: collectionDate.toISOString().split("T")[0],
          status: "collected",
          collectedAt: collectionDate.toISOString(),
          pantryId,
          contractId,
        })
      }

      for (let week = 1; week <= 3; week++) {
        const collectionDate = new Date(secondCycleStart)
        collectionDate.setDate(collectionDate.getDate() + (week - 1) * 7)
        const isPast = collectionDate < today

        collections.push({
          id: `${trackingId}-c${contractId}-cycle2-w${week}`,
          referralId: trackingId,
          weekNumber: week,
          expectedDate: collectionDate.toISOString().split("T")[0],
          status: isPast ? "collected" : "pending",
          collectedAt: isPast && Math.random() < 0.75 ? collectionDate.toISOString() : undefined,
          pantryId,
          contractId,
        })
      }
    } else {
      // Regular active referrals
      const weeksAgo = (i % 6) + 1
      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() - weeksAgo * 7)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 8 * 7)

      cycles.push({
        contractId,
        cycleStartDate: startDate.toISOString().split("T")[0],
        cycleEndDate: endDate.toISOString().split("T")[0],
        currentWeek: weeksAgo + 1,
        status: "active",
      })

      for (let week = 1; week <= weeksAgo + 1; week++) {
        const collectionDate = new Date(startDate)
        collectionDate.setDate(collectionDate.getDate() + (week - 1) * 7)
        const isPast = collectionDate < today

        collections.push({
          id: `${trackingId}-c${contractId}-w${week}`,
          referralId: trackingId,
          weekNumber: week,
          expectedDate: collectionDate.toISOString().split("T")[0],
          status: isPast ? (Math.random() < 0.75 ? "collected" : "no-show") : "pending",
          collectedAt: isPast && Math.random() < 0.75 ? collectionDate.toISOString() : undefined,
          pantryId,
          contractId,
        })
      }
    }

    const collectionsCompleted = collections.filter((c) => c.status === "collected").length
    const creationDate = cycles[0] ? new Date(cycles[0].cycleStartDate) : new Date()

    referrals.push({
      id: trackingId,
      firstName: firstNames[i % firstNames.length],
      lastName: lastNames[i % lastNames.length],
      phone: `07${Math.floor(Math.random() * 900000000 + 100000000)}`,
      email:
        i % 3 === 0
          ? `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@email.com`
          : undefined,
      familyComposition,
      dietaryRequirements: i % 4 === 0 ? "Vegetarian" : i % 5 === 0 ? "Gluten-free" : undefined,
      address: `${Math.floor(Math.random() * 100 + 1)} Sample Street, Glasgow`,
      pantryId,
      fwwId,
      cycles,
      trackingUrl: `/track/${trackingId}`,
      collectionsCompleted,
      collections,
      createdAt: creationDate.toISOString(),
      createdBy: fwwId === 1 ? "Jane Smith" : fwwId === 2 ? "Michael Brown" : "Aisha Khan",
      accessibilityFlag: i % 5 === 0 ? true : false, // 20% have accessibility needs
      fwwNotes:
        i % 3 === 0
          ? `Initial assessment completed. ${i % 2 === 0 ? "Family is settling in well." : "May need additional support."}`
          : undefined,
    })
  }

  console.log("[v0] Generated", referrals.length, "referrals")
  console.log("[v0] Pantry #1 has", referrals.filter((r) => r.pantryId === 1).length, "referrals")
  console.log(
    "[v0] Cancelled referrals:",
    referrals.filter((r) => r.cycles.some((c) => c.status === "cancelled")).length,
  )
  console.log("[v0] Re-referred:", referrals.filter((r) => r.cycles.length > 1).length)
  console.log("[v0] With accessibility flag:", referrals.filter((r) => r.accessibilityFlag).length)
  console.log("[v0] With FWW notes:", referrals.filter((r) => r.fwwNotes).length)

  return referrals
}

export function getContracts(): Contract[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.contracts)
  return data ? JSON.parse(data) : []
}

export function getPantries(): Pantry[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.pantries)
  return data ? JSON.parse(data) : []
}

export function getPlatformUsers(): PlatformUser[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.platformUsers)
  return data ? JSON.parse(data) : []
}

export function getReferrals(): Referral[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.referrals)
  return data ? JSON.parse(data) : []
}

export function getReferralByTrackingId(trackingId: string): Referral | undefined {
  const referrals = getReferrals()
  return referrals.find((r) => r.id === trackingId)
}

export function getReferralById(id: string): Referral | undefined {
  const referrals = getReferrals()
  return referrals.find((r) => r.id === id)
}

export function saveContract(contract: Contract) {
  const contracts = getContracts()
  const index = contracts.findIndex((c) => c.id === contract.id)
  if (index >= 0) {
    contracts[index] = contract
  } else {
    contracts.push(contract)
  }
  localStorage.setItem(STORAGE_KEYS.contracts, JSON.stringify(contracts))
}

export function savePantry(pantry: Pantry) {
  const pantries = getPantries()
  const index = pantries.findIndex((p) => p.id === pantry.id)
  if (index >= 0) {
    pantries[index] = pantry
  } else {
    pantries.push(pantry)
  }
  localStorage.setItem(STORAGE_KEYS.pantries, JSON.stringify(pantries))
}

export function savePlatformUser(user: PlatformUser) {
  const users = getPlatformUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index >= 0) {
    users[index] = user
  } else {
    users.push(user)
  }
  localStorage.setItem(STORAGE_KEYS.platformUsers, JSON.stringify(users))
}

export function saveReferral(referral: Referral) {
  const referrals = getReferrals()
  const index = referrals.findIndex((r) => r.id === referral.id)
  if (index >= 0) {
    referrals[index] = referral
  } else {
    referrals.push(referral)
  }
  localStorage.setItem(STORAGE_KEYS.referrals, JSON.stringify(referrals))
}

export function updateCollection(
  referralId: string,
  collectionId: string,
  status: "collected" | "no-show",
  collectedAt?: string,
) {
  const referrals = getReferrals()
  const referral = referrals.find((r) => r.id === referralId)
  if (referral) {
    const collection = referral.collections.find((c) => c.id === collectionId)
    if (collection) {
      collection.status = status
      collection.collectedAt = collectedAt
      referral.collectionsCompleted = referral.collections.filter((c) => c.status === "collected").length
      referral.updatedAt = new Date().toISOString()
      saveReferral(referral)
    }
  }
}

// Role management
export function getCurrentRole() {
  if (typeof window === "undefined") return "admin"
  return localStorage.getItem(STORAGE_KEYS.currentRole) || "admin"
}

export function setCurrentRole(role: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.currentRole, role)
}

export function clearAllData() {
  if (typeof window === "undefined") return
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
  console.log("[v0] All localStorage data cleared")
}

// Backward compatibility - keep old function names as aliases
export const getUsers = getReferrals
export const getUserByTrackingId = getReferralByTrackingId
export const saveUser = saveReferral
export const getFWWs = getPlatformUsers

export function calculateBoxesNeeded(totalHousehold: number): number {
  // Each box serves 4 people
  return Math.ceil(totalHousehold / 4)
}
