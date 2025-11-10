// Data service for localStorage operations
import type { Contract, Pantry, FWW, User, Collection, FamilyComposition } from "./types"

const DATA_VERSION = "1.4" // Increment this to force data refresh with fixed date logic

const STORAGE_KEYS = {
  contracts: "spn_contracts",
  pantries: "spn_pantries",
  users: "spn_users",
  fwws: "spn_fwws",
  collections: "spn_collections",
  currentRole: "spn_currentRole",
  initialized: "spn_initialized",
  dataVersion: "spn_dataVersion", // Track data version
}

// Initialize dummy data
export function initializeData() {
  if (typeof window === "undefined") return

  const currentVersion = localStorage.getItem(STORAGE_KEYS.dataVersion)
  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized)

  if (isInitialized && currentVersion === DATA_VERSION) {
    return // Data is current, no need to reinitialize
  }

  // Contracts
  const contracts: Contract[] = [
    {
      id: 1,
      name: "NHS Glasgow Individual Referral Program Q4 2025",
      organization: "NHS Glasgow",
      startDate: "2025-10-01",
      endDate: "2026-03-31",
      cycleLength: 8,
      frequency: "weekly",
      collectionDay: "Tuesday",
      eligiblePantries: [1, 2, 3],
      surveyUrl: "https://typeform.com/nhs-survey",
      active: true,
      totalUsers: 45,
      activeUsers: 38,
    },
    {
      id: 2,
      name: "Glasgow Council Family Support",
      organization: "Glasgow City Council",
      startDate: "2025-09-15",
      endDate: "2026-02-28",
      cycleLength: 8,
      frequency: "weekly",
      collectionDay: "Wednesday",
      eligiblePantries: [2, 3, 4],
      surveyUrl: "https://surveymonkey.com/council-survey",
      active: true,
      totalUsers: 22,
      activeUsers: 19,
    },
    {
      id: 3,
      name: "Edinburgh NHS Pilot",
      organization: "NHS Lothian",
      startDate: "2025-11-01",
      endDate: "2026-04-30",
      cycleLength: 8,
      frequency: "weekly",
      collectionDay: "Thursday",
      eligiblePantries: [5],
      surveyUrl: null,
      active: true,
      totalUsers: 8,
      activeUsers: 8,
    },
  ]

  // Pantries
  const pantries: Pantry[] = [
    {
      id: 1,
      name: "Tollcross Community Pantry",
      address: "42 Tollcross Road, Glasgow, G32 8AF",
      region: "East Glasgow",
      collectionDay: "Tuesday",
      collectionTime: "10:00 AM - 4:00 PM",
      coordinator: "Sarah McDonald",
      active: true,
      weeklyCapacity: 50,
    },
    {
      id: 2,
      name: "Govan Community Hub",
      address: "15 Govan Road, Glasgow, G51 1JL",
      region: "South Glasgow",
      collectionDay: "Tuesday, Wednesday",
      collectionTime: "10:00 AM - 4:00 PM",
      coordinator: "James Wilson",
      active: true,
      weeklyCapacity: 40,
    },
    {
      id: 3,
      name: "Maryhill Pantry",
      address: "88 Maryhill Road, Glasgow, G20 7QB",
      region: "North Glasgow",
      collectionDay: "Tuesday, Wednesday",
      collectionTime: "11:00 AM - 3:00 PM",
      coordinator: "Emma Thompson",
      active: true,
      weeklyCapacity: 35,
    },
    {
      id: 4,
      name: "Drumchapel Food Hub",
      address: "120 Drumchapel Road, Glasgow, G15 6QE",
      region: "West Glasgow",
      collectionDay: "Wednesday",
      collectionTime: "10:00 AM - 4:00 PM",
      coordinator: "David Chen",
      active: true,
      weeklyCapacity: 30,
    },
    {
      id: 5,
      name: "Edinburgh Gorgie Pantry",
      address: "55 Gorgie Road, Edinburgh, EH11 2LA",
      region: "Edinburgh West",
      collectionDay: "Thursday",
      collectionTime: "10:00 AM - 4:00 PM",
      coordinator: "Linda Brown",
      active: true,
      weeklyCapacity: 25,
    },
  ]

  // FWWs
  const fwws: FWW[] = [
    {
      id: 1,
      name: "Jane Smith",
      email: "jane.smith@nhs.scot",
      organization: "NHS Glasgow",
      assignedContracts: [1],
      totalReferrals: 45,
      activeReferrals: 38,
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "michael.brown@glasgow.gov.uk",
      organization: "Glasgow City Council",
      assignedContracts: [2],
      totalReferrals: 22,
      activeReferrals: 19,
    },
    {
      id: 3,
      name: "Aisha Khan",
      email: "aisha.khan@nhs.scot",
      organization: "NHS Lothian",
      assignedContracts: [3],
      totalReferrals: 8,
      activeReferrals: 8,
    },
  ]

  // Generate 25 users with varied states
  const users: User[] = generateDummyUsers()

  localStorage.setItem(STORAGE_KEYS.contracts, JSON.stringify(contracts))
  localStorage.setItem(STORAGE_KEYS.pantries, JSON.stringify(pantries))
  localStorage.setItem(STORAGE_KEYS.fwws, JSON.stringify(fwws))
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
  localStorage.setItem(STORAGE_KEYS.initialized, "true")
  localStorage.setItem(STORAGE_KEYS.dataVersion, DATA_VERSION)
}

function generateDummyUsers(): User[] {
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
    { adults: 1, childrenUnder5: 0, children6to12: 0, children13to18: 0, totalHousehold: 1 }, // Single adult
    { adults: 1, childrenUnder5: 1, children6to12: 0, children13to18: 0, totalHousehold: 2 }, // Adult with toddler
    { adults: 2, childrenUnder5: 0, children6to12: 1, children13to18: 1, totalHousehold: 4 }, // Family of 4
    { adults: 2, childrenUnder5: 2, children6to12: 1, children13to18: 0, totalHousehold: 5 }, // Large family
    { adults: 1, childrenUnder5: 0, children6to12: 2, children13to18: 1, totalHousehold: 4 }, // Single parent
    { adults: 2, childrenUnder5: 0, children6to12: 0, children13to18: 0, totalHousehold: 2 }, // Couple
    { adults: 1, childrenUnder5: 2, children6to12: 0, children13to18: 0, totalHousehold: 3 }, // Adult with 2 young kids
    { adults: 2, childrenUnder5: 1, children6to12: 2, children13to18: 0, totalHousehold: 5 }, // Family of 5
  ]

  const users: User[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day

  console.log("[v0] Generating dummy users. Today is:", today.toDateString())

  // First 12 users assigned to Pantry #1 with more pending collections
  for (let i = 0; i < 25; i++) {
    let contractId: number
    let pantryId: number
    let collectionDay: string

    // First 12 users assigned to Pantry #1 (Tollcross - Tuesday)
    if (i < 12) {
      contractId = 1 // NHS Glasgow (Tuesday collections)
      pantryId = 1 // Tollcross
      collectionDay = "Tuesday"
    } else if (i < 18) {
      contractId = 2 // Glasgow Council (Wednesday)
      pantryId = [2, 3, 4][i % 3]
      collectionDay = "Wednesday"
    } else {
      contractId = 3 // Edinburgh NHS (Thursday)
      pantryId = 5
      collectionDay = "Thursday"
    }

    const fwwId = contractId

    let weeksAgo: number
    if (i < 10) {
      // These users are at week 1-6 of their cycle, with a collection due today
      weeksAgo = i % 6
    } else if (i < 15) {
      weeksAgo = 3
    } else if (i < 20) {
      weeksAgo = 6
    } else if (i < 23) {
      weeksAgo = 8
    } else {
      weeksAgo = 10 // Completed users
    }

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - weeksAgo * 7)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 8 * 7)

    const currentWeek = Math.min(weeksAgo + 1, 8)
    const isCompleted = weeksAgo >= 8

    const trackingId = Math.random().toString(36).substring(2, 10)

    const familyComposition = familyCompositions[i % familyCompositions.length]

    // Generate collections for each week
    const collections: Collection[] = []
    for (let week = 1; week <= Math.min(currentWeek, 8); week++) {
      const collectionDate = new Date(startDate)
      collectionDate.setDate(collectionDate.getDate() + (week - 1) * 7)
      collectionDate.setHours(0, 0, 0, 0)

      const collectionDateStr = collectionDate.toDateString()
      const todayStr = today.toDateString()
      const isPast = collectionDate < today
      const isToday = collectionDateStr === todayStr

      if (i < 12 && isToday) {
        console.log(
          `[v0] User ${i} (Pantry #1) has collection TODAY (${collectionDateStr}). Status will be: ${i < 6 ? "collected" : "pending"}`,
        )
      }

      let status: "pending" | "collected" | "no-show"
      if (isToday && i < 12) {
        // For Pantry #1 users scheduled today: first 6 are collected, next 6 are pending
        status = i < 6 ? "collected" : "pending"
      } else if (isToday) {
        // Other pantries: mix of statuses
        status = i % 2 === 0 ? "collected" : "pending"
      } else if (isPast) {
        // Past collections: 70% attendance rate with some variation
        const attendance = i < 5 ? 1.0 : i < 10 ? 0.85 : i < 15 ? 0.65 : 0.5
        status = Math.random() < attendance ? "collected" : "no-show"
      } else {
        status = "pending"
      }

      collections.push({
        id: `${trackingId}-w${week}`,
        userId: trackingId,
        weekNumber: week,
        expectedDate: collectionDate.toISOString().split("T")[0],
        status,
        collectedAt: status === "collected" ? collectionDate.toISOString() : undefined,
        pantryId,
      })
    }

    const collectionsCompleted = collections.filter((c) => c.status === "collected").length

    users.push({
      id: trackingId,
      firstName: firstNames[i % firstNames.length],
      lastName: lastNames[i % lastNames.length],
      phone: `07${Math.floor(Math.random() * 900000000 + 100000000)}`,
      email:
        i % 3 === 0
          ? `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@email.com`
          : undefined,
      familyComposition,
      dietaryRequirements: i % 4 === 0 ? "Vegetarian" : undefined,
      address: `${Math.floor(Math.random() * 100 + 1)} Sample Street, Glasgow`,
      contractId,
      pantryId,
      fwwId,
      status: isCompleted ? "completed" : "active",
      cycleStartDate: startDate.toISOString().split("T")[0],
      cycleEndDate: endDate.toISOString().split("T")[0],
      currentWeek,
      trackingUrl: `/track/${trackingId}`,
      collectionsCompleted,
      collections,
      createdAt: startDate.toISOString(),
      createdBy: fwwId === 1 ? "Jane Smith" : fwwId === 2 ? "Michael Brown" : "Aisha Khan",
    })
  }

  console.log("[v0] Generated", users.length, "users")
  const pantry1Users = users.filter((u) => u.pantryId === 1)
  console.log("[v0] Pantry #1 has", pantry1Users.length, "users")

  return users
}

// Getter functions
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

export function getFWWs(): FWW[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.fwws)
  return data ? JSON.parse(data) : []
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.users)
  return data ? JSON.parse(data) : []
}

export function getUserByTrackingId(trackingId: string): User | undefined {
  const users = getUsers()
  return users.find((u) => u.id === trackingId)
}

// Setter functions
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

export function saveUser(user: User) {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index >= 0) {
    users[index] = user
  } else {
    users.push(user)
  }
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
}

export function updateCollection(
  userId: string,
  weekNumber: number,
  status: "collected" | "no-show",
  collectedAt?: string,
) {
  const users = getUsers()
  const user = users.find((u) => u.id === userId)
  if (user) {
    const collection = user.collections.find((c) => c.weekNumber === weekNumber)
    if (collection) {
      collection.status = status
      collection.collectedAt = collectedAt
      user.collectionsCompleted = user.collections.filter((c) => c.status === "collected").length
      saveUser(user)
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

// Migration function to update existing users with old data structure
export function migrateUsersToFamilyComposition() {
  if (typeof window === "undefined") return

  const users = getUsers()
  let needsUpdate = false

  const updatedUsers = users.map((user) => {
    // If user has old familySize property but no familyComposition, migrate it
    if (!user.familyComposition && (user as any).familySize) {
      needsUpdate = true
      const familySize = (user as any).familySize
      // Create a default family composition based on family size
      return {
        ...user,
        familyComposition: {
          adults: familySize >= 2 ? 2 : 1,
          childrenUnder5: 0,
          children6to12: Math.max(0, familySize - 2),
          children13to18: 0,
          totalHousehold: familySize,
        },
      }
    }
    return user
  })

  if (needsUpdate) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(updatedUsers))
  }
}

export function clearAllData() {
  if (typeof window === "undefined") return
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
  console.log("[v0] All localStorage data cleared")
}
