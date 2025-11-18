"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  getContracts,
  getPantries,
  getReferrals,
  getPlatformUsers,
  saveContract,
  savePantry,
  savePlatformUser,
  saveReferral, // Added saveReferral import for creating new referrals
  calculateBoxesNeeded,
} from "@/lib/data-service"
import type { Contract, Pantry, Referral, PlatformUser } from "@/lib/types"
import { Users, Building, FileText, TrendingUp, Plus, Search, Edit, Eye } from 'lucide-react'
import { BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Checkbox } from "@/components/ui/checkbox"

function formatDate(date: string | Date, formatStr = "MMM d, yyyy"): string {
  const d = new Date(date)
  const month = d.toLocaleDateString("en-US", { month: "short" })
  const day = d.getDate()
  const year = d.getFullYear()
  return `${month} ${day}, ${year}`
}

function getReferralStatus(referral: Referral): "active" | "completed" | "cancelled" {
  if (!referral.cycles || referral.cycles.length === 0) {
    return "completed"
  }

  const latestCycle = referral.cycles[referral.cycles.length - 1]
  return latestCycle.status
}

export default function AdminDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [pantries, setPantries] = useState<Pantry[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const loadedContracts = getContracts()
    const loadedPantries = getPantries()
    const loadedReferrals = getReferrals()
    const loadedPlatformUsers = getPlatformUsers()

    setContracts(loadedContracts || [])
    setPantries(loadedPantries || [])
    setReferrals(loadedReferrals || [])
    setPlatformUsers(loadedPlatformUsers || [])
  }

  const activeReferrals = referrals.filter((r) => getReferralStatus(r) === "active").length
  const fwws = platformUsers.filter((u) => u.role === "fww")

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl min-h-screen bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg mt-1">Network overview and management</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-8">
        <div className="sticky top-[73px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none border-border/40">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-xl gap-1">
            <TabsTrigger value="overview" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Contracts</TabsTrigger>
            <TabsTrigger value="pantries" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Pantries</TabsTrigger>
            <TabsTrigger value="referrals" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Referrals</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Users</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Reports</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-lg shadow-black/5 hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Referrals</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeReferrals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {referrals.filter((r) => getReferralStatus(r) === "completed").length} completed
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-black/5 hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Contracts</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{contracts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">{contracts.filter((c) => c.active).length} active</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-black/5 hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pantries</CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Building className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pantries.length}</div>
                <p className="text-xs text-muted-foreground mt-1">{pantries.filter((p) => p.active).length} active</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-black/5 hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">FWWs</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{fwws.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Family Wellbeing Workers</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg shadow-black/5">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ContractDialog onSave={loadData} contracts={contracts} pantries={pantries}>
                  <Button className="w-full justify-start h-12 text-base font-medium" variant="outline">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    Create New Contract
                  </Button>
                </ContractDialog>
                <PantryDialog onSave={loadData} contracts={contracts}>
                  <Button className="w-full justify-start h-12 text-base font-medium" variant="outline">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    Create New Pantry
                  </Button>
                </PantryDialog>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-black/5">
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((referral) => {
                      const fww = platformUsers.find((u) => u.id === referral.fwwId)
                      return (
                        <div key={referral.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-medium">
                              {referral.firstName[0]}{referral.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">
                                {referral.firstName} {referral.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">Referred by {fww?.name || "Unknown"}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-background">{formatDate(referral.createdAt)}</Badge>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-background border-border/50 shadow-sm"
              />
            </div>
            <ContractDialog onSave={loadData} contracts={contracts} pantries={pantries}>
              <Button size="lg" className="w-full md:w-auto shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Create Contract
              </Button>
            </ContractDialog>
          </div>

          <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold">Contract Name</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Pantries</TableHead>
                  <TableHead className="font-semibold">Cycle Length</TableHead>
                  <TableHead className="font-semibold">Dates</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts
                  .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-muted/30 border-border/50">
                      <TableCell className="font-medium">{contract.name}</TableCell>
                      <TableCell>
                        <Badge variant={contract.active ? "default" : "secondary"} className={contract.active ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-0" : ""}>
                          {contract.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{contract.eligiblePantryIds?.length || 0} pantries</TableCell>
                      <TableCell>{contract.cycleWeeks} weeks</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ContractDialog contract={contract} onSave={loadData} contracts={contracts} pantries={pantries}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </ContractDialog>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Pantries Tab */}
        <TabsContent value="pantries" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pantries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-background border-border/50 shadow-sm"
              />
            </div>
            <PantryDialog onSave={loadData} contracts={contracts}>
              <Button size="lg" className="w-full md:w-auto shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Create Pantry
              </Button>
            </PantryDialog>
          </div>

          <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold">Pantry Name</TableHead>
                  <TableHead className="font-semibold">Region</TableHead>
                  <TableHead className="font-semibold">Coordinator</TableHead>
                  <TableHead className="font-semibold">Contracts</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pantries
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.region.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map((pantry) => (
                    <TableRow key={pantry.id} className="hover:bg-muted/30 border-border/50">
                      <TableCell className="font-medium">{pantry.name}</TableCell>
                      <TableCell>{pantry.region}</TableCell>
                      <TableCell>{pantry.coordinator}</TableCell>
                      <TableCell>{Object.keys(pantry.contractCollectionDays || {}).length} contracts</TableCell>
                      <TableCell>
                        <Badge variant={pantry.active ? "default" : "secondary"} className={pantry.active ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-0" : ""}>
                          {pantry.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <PantryDialog pantry={pantry} onSave={loadData} contracts={contracts}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PantryDialog>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search referrals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-background border-border/50 shadow-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px] h-11 bg-background border-border/50 shadow-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Referrals</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <CreateReferralDialog
              onSave={loadData}
              contracts={contracts}
              pantries={pantries}
              platformUsers={platformUsers}
            >
              <Button size="lg" className="w-full md:w-auto shadow-lg shadow-primary/20 ml-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Referral
              </Button>
            </CreateReferralDialog>
          </div>

          <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Contract</TableHead>
                  <TableHead className="font-semibold">Pantry</TableHead>
                  <TableHead className="font-semibold">Boxes</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">FWW</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals
                  .filter((r) => {
                    const matchesSearch =
                      r.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.lastName.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesStatus = filterStatus === "all" || getReferralStatus(r) === filterStatus
                    return matchesSearch && matchesStatus
                  })
                  .map((referral) => {
                    const currentCycle =
                      referral.cycles && referral.cycles.length > 0 ? referral.cycles[referral.cycles.length - 1] : null
                    const contract = currentCycle ? contracts.find((c) => c.id === currentCycle.contractId) : null
                    const pantry = pantries.find((p) => p.id === referral.pantryId)
                    const fww = platformUsers.find((u) => u.id === referral.fwwId)
                    const status = getReferralStatus(referral)
                    const boxesNeeded = calculateBoxesNeeded(referral.familyComposition?.totalHousehold || 0)

                    return (
                      <TableRow key={referral.id} className="hover:bg-muted/30 border-border/50">
                        <TableCell className="font-medium">
                          {referral.firstName} {referral.lastName}
                        </TableCell>
                        <TableCell className="text-sm">{contract?.name || "N/A"}</TableCell>
                        <TableCell className="text-sm">{pantry?.name || "N/A"}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{boxesNeeded}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({referral.familyComposition?.totalHousehold || 0} people)
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status === "active" ? "default" : "secondary"} className={status === "active" ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-0" : ""}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{fww?.name || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/fww/referrals/${referral.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Platform Users Tab */}
        <TabsContent value="users" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Platform Users</h3>
            <PlatformUserDialog onSave={loadData} contracts={contracts} pantries={pantries}>
              <Button size="lg" className="shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </PlatformUserDialog>
          </div>

          <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Organization</TableHead>
                  <TableHead className="font-semibold">Assignments</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 border-border/50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background">{user.role.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{user.organization || "N/A"}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {user.role === "fww" &&
                        user.assignedContractIds &&
                        user.assignedContractIds.length > 0 &&
                        user.assignedContractIds
                          .map((id) => contracts.find((c) => c.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")}
                      {user.role === "coordinator" &&
                        user.assignedPantryIds &&
                        user.assignedPantryIds.length > 0 &&
                        user.assignedPantryIds
                          .map((id) => pantries.find((p) => p.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")}
                      {user.role === "admin" && "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <PlatformUserDialog user={user} onSave={loadData} contracts={contracts} pantries={pantries}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PlatformUserDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ReportsSection
            users={referrals}
            contracts={contracts}
            pantries={pantries}
            fwws={platformUsers.filter((u) => u.role === "fww")}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContractDialog({
  contract,
  onSave,
  children,
  contracts,
  pantries,
}: {
  contract?: Contract
  onSave: () => void
  children: React.ReactNode
  contracts: Contract[]
  pantries: Pantry[]
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Contract>>(
    contract || {
      name: "",
      startDate: "",
      endDate: "",
      cycleWeeks: 8,
      frequency: "weekly",
      eligiblePantryIds: [],
      surveyUrl: "",
      active: true,
    },
  )

  const handleSave = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newContract: Contract = {
      ...formData,
      id: contract?.id || `contract_${Date.now()}`,
    } as Contract

    saveContract(newContract)
    toast({
      title: "Success",
      description: `Contract ${contract ? "updated" : "created"} successfully`,
    })
    setOpen(false)
    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? "Edit Contract" : "Create New Contract"}</DialogTitle>
          <DialogDescription>
            {contract ? "Update contract details" : "Add a new contract to the system"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Contract Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="surveyUrl">Survey URL (Optional)</Label>
            <Input
              id="surveyUrl"
              value={formData.surveyUrl || ""}
              onChange={(e) => setFormData({ ...formData, surveyUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cycleWeeks">Cycle Length (Weeks) *</Label>
              <Input
                id="cycleWeeks"
                type="number"
                min="1"
                value={formData.cycleWeeks}
                onChange={(e) => setFormData({ ...formData, cycleWeeks: Number.parseInt(e.target.value, 10) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as "weekly" | "bi-weekly" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Eligible Pantries</Label>
            <p className="text-sm text-muted-foreground">Select which pantries can use this contract</p>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
              {pantries.map((pantry) => (
                <label key={pantry.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.eligiblePantryIds?.includes(pantry.id) || false}
                    onChange={(e) => {
                      const current = formData.eligiblePantryIds || []
                      setFormData({
                        ...formData,
                        eligiblePantryIds: e.target.checked
                          ? [...current, pantry.id]
                          : current.filter((id) => id !== pantry.id),
                      })
                    }}
                  />
                  <span className="text-sm">{pantry.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{contract ? "Update" : "Create"} Contract</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PantryDialog({
  pantry,
  onSave,
  children,
  contracts,
}: {
  pantry?: Pantry
  onSave: () => void
  children: React.ReactNode
  contracts: Contract[]
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Pantry>>(
    pantry || {
      name: "",
      address: "",
      region: "",
      coordinator: "",
      operatingHours: {},
      contractCollectionDays: {},
      active: true,
    },
  )

  const handleSave = () => {
    if (!formData.name || !formData.address || !formData.region) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newPantry: Pantry = {
      ...formData,
      id: pantry?.id || `pantry_${Date.now()}`,
    } as Pantry

    savePantry(newPantry)
    toast({
      title: "Success",
      description: `Pantry ${pantry ? "updated" : "created"} successfully`,
    })
    setOpen(false)
    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pantry ? "Edit Pantry" : "Create New Pantry"}</DialogTitle>
          <DialogDescription>{pantry ? "Update pantry details" : "Add a new pantry to the network"}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pantryName">Pantry Name *</Label>
            <Input
              id="pantryName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Full Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coordinator">Coordinator Name</Label>
              <Input
                id="coordinator"
                value={formData.coordinator}
                onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Operating Hours (per day)</Label>
            <p className="text-sm text-muted-foreground">Define when the pantry is open</p>
            <div className="text-sm text-muted-foreground">Simplified for prototype - full implementation pending</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{pantry ? "Update" : "Create"} Pantry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// User Detail Dialog Component
function UserDetailDialog({
  user,
  contract,
  pantry,
  children,
}: {
  user: any
  contract?: Contract
  pantry?: Pantry
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user.firstName} {user.lastName}
          </DialogTitle>
          <DialogDescription>User Details and Collection History</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Phone:</span> {user.phone}
                </p>
                {user.email && (
                  <p>
                    <span className="text-muted-foreground">Email:</span> {user.email}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Family Size:</span>{" "}
                  {user.familyComposition?.totalHousehold || "N/A"}
                </p>
                {user.dietaryRequirements && (
                  <p>
                    <span className="text-muted-foreground">Dietary Requirements:</span> {user.dietaryRequirements}
                  </p>
                )}
                {user.address && (
                  <p>
                    <span className="text-muted-foreground">Address:</span> {user.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Program Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Contract:</span> {contract?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Pantry:</span> {pantry?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                </p>
                {user.cycles && user.cycles.length > 0 && (
                  <>
                    <p>
                      <span className="text-muted-foreground">Cycle:</span>{" "}
                      {formatDate(user.cycles[user.cycles.length - 1].startDate)} -{" "}
                      {formatDate(user.cycles[user.cycles.length - 1].endDate)}
                    </p>
                  </>
                )}
                <p>
                  <span className="text-muted-foreground">Referred by:</span> {user.createdBy}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tracking URL</h3>
              <code className="text-sm bg-muted p-2 rounded block">
                {typeof window !== "undefined" ? window.location.origin : ""}
                {user.trackingUrl}
              </code>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Collection History</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.collections && user.collections.length > 0 ? (
                  user.collections.map((collection: any) => (
                    <TableRow key={collection.id}>
                      <TableCell>Week {collection.weekNumber}</TableCell>
                      <TableCell>{formatDate(collection.expectedDate)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            collection.status === "collected"
                              ? "default"
                              : collection.status === "no-show"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {collection.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No collection history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Reports Section Component
function ReportsSection({
  users,
  contracts,
  pantries,
  fwws,
}: {
  users: Referral[]
  contracts: Contract[]
  pantries: Pantry[]
  fwws: PlatformUser[]
}) {
  const [reportType, setReportType] = useState<"collections" | "referrals" | "uptake">("collections")
  const { toast } = useToast()

  const handleExport = () => {
    toast({
      title: "Success",
      description: "Report exported successfully",
    })
  }

  // Calculate collections report data
  const collectionsData = pantries.map((pantry) => {
    const pantryUsers = users.filter((u) => u.pantryId === pantry.id)
    const totalCollections = pantryUsers.reduce((sum, u) => sum + (u.collections?.length || 0), 0)
    const collected = pantryUsers.reduce(
      (sum, u) => sum + (u.collections?.filter((c) => c.status === "collected")?.length || 0),
      0,
    )
    const noShows = pantryUsers.reduce(
      (sum, u) => sum + (u.collections?.filter((c) => c.status === "no-show")?.length || 0),
      0,
    )
    const attendance = totalCollections > 0 ? Math.round((collected / totalCollections) * 100) : 0

    return {
      pantry: pantry.name,
      expected: totalCollections,
      collected,
      noShows,
      attendance,
    }
  })

  const contractCollections = contracts.map((contract) => {
    const contractUsers = users.filter((u) => {
      const currentCycle = u.cycles && u.cycles.length > 0 ? u.cycles[u.cycles.length - 1] : null
      return currentCycle?.contractId === contract.id
    })
    const totalCollections = contractUsers.reduce((sum, u) => sum + (u.collections?.length || 0), 0)
    const collected = contractUsers.reduce(
      (sum, u) => sum + (u.collections?.filter((c) => c.status === "collected")?.length || 0),
      0,
    )
    const noShows = contractUsers.reduce(
      (sum, u) => sum + (u.collections?.filter((c) => c.status === "no-show")?.length || 0),
      0,
    )
    const attendance = totalCollections > 0 ? Math.round((collected / totalCollections) * 100) : 0

    return {
      contract: contract.name,
      expected: totalCollections,
      collected,
      noShows,
      attendance,
    }
  })

  // Calculate referrals report data
  const referralsData = fwws.map((fww) => {
    const fwwUsers = users.filter((u) => u.fwwId === fww.id)
    const mostRecentTimestamp =
      fwwUsers.length > 0 ? Math.max(...fwwUsers.map((u) => new Date(u.createdAt).getTime())) : 0
    return {
      fww: fww.name,
      referrals: fwwUsers.length,
      contracts: [...new Set(fwwUsers.map((u) => u.cycles?.[0]?.contractId).filter(Boolean))].length,
      mostRecent: mostRecentTimestamp > 0 ? formatDate(new Date(mostRecentTimestamp)) : "N/A",
    }
  })

  // Calculate uptake report data
  const uptakeData = contracts.map((contract) => {
    const contractUsers = users.filter((u) => {
      const currentCycle = u.cycles && u.cycles.length > 0 ? u.cycles[u.cycles.length - 1] : null
      return currentCycle?.contractId === contract.id
    })
    const totalCollections = contractUsers.reduce((sum, u) => sum + (u.collections?.length || 0), 0)
    const collected = contractUsers.reduce(
      (sum, u) => sum + (u.collections?.filter((c) => c.status === "collected")?.length || 0),
      0,
    )
    const attendance = totalCollections > 0 ? Math.round((collected / totalCollections) * 100) : 0

    return {
      contract: contract.name,
      activeUsers: contractUsers.filter((u) => getReferralStatus(u) === "active").length,
      attendance,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={reportType} onValueChange={(v) => setReportType(v as any)} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-xl gap-1">
            <TabsTrigger value="collections" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Collections Report</TabsTrigger>
            <TabsTrigger value="referrals" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Referrals Report</TabsTrigger>
            <TabsTrigger value="uptake" className="rounded-lg py-2.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Uptake Report</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleExport}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Collections Report */}
          <TabsContent value="collections" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{collectionsData.reduce((sum, d) => sum + d.collected, 0)}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(
                      collectionsData.reduce((sum, d) => sum + d.attendance, 0) / Math.max(collectionsData.length, 1),
                    )}
                    %
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total No-Shows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{collectionsData.reduce((sum, d) => sum + d.noShows, 0)}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
              <CardHeader>
                <CardTitle>By Pantry</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-semibold">Pantry Name</TableHead>
                      <TableHead className="font-semibold">Expected</TableHead>
                      <TableHead className="font-semibold">Collected</TableHead>
                      <TableHead className="font-semibold">No-Shows</TableHead>
                      <TableHead className="font-semibold">Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collectionsData.map((data, i) => (
                      <TableRow key={i} className="hover:bg-muted/30 border-border/50">
                        <TableCell className="font-medium">{data.pantry}</TableCell>
                        <TableCell>{data.expected}</TableCell>
                        <TableCell>{data.collected}</TableCell>
                        <TableCell>{data.noShows}</TableCell>
                        <TableCell>{data.attendance}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
              <CardHeader>
                <CardTitle>By Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-semibold">Contract Name</TableHead>
                      <TableHead className="font-semibold">Expected</TableHead>
                      <TableHead className="font-semibold">Collected</TableHead>
                      <TableHead className="font-semibold">No-Shows</TableHead>
                      <TableHead className="font-semibold">Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractCollections.map((data, i) => (
                      <TableRow key={i} className="hover:bg-muted/30 border-border/50">
                        <TableCell className="font-medium">{data.contract}</TableCell>
                        <TableCell>{data.expected}</TableCell>
                        <TableCell>{data.collected}</TableCell>
                        <TableCell>{data.noShows}</TableCell>
                        <TableCell>{data.attendance}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Report */}
          <TabsContent value="referrals" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active FWWs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{fwws.length}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{contracts.filter((c) => c.active).length}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
              <CardHeader>
                <CardTitle>By FWW</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-semibold">FWW Name</TableHead>
                      <TableHead className="font-semibold">Referrals Created</TableHead>
                      <TableHead className="font-semibold">Contracts Used</TableHead>
                      <TableHead className="font-semibold">Most Recent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralsData.map((data, i) => (
                      <TableRow key={i} className="hover:bg-muted/30 border-border/50">
                        <TableCell className="font-medium">{data.fww}</TableCell>
                        <TableCell>{data.referrals}</TableCell>
                        <TableCell>{data.contracts}</TableCell>
                        <TableCell>{data.mostRecent}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Uptake Report */}
          <TabsContent value="uptake" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(uptakeData.reduce((sum, d) => sum + d.attendance, 0) / Math.max(uptakeData.length, 1))}%
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Users with 100% Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {
                      users.filter((u) => {
                        const currentCycle = u.cycles && u.cycles.length > 0 ? u.cycles[u.cycles.length - 1] : null
                        const currentWeek = currentCycle?.currentWeek || 0
                        return u.collectionsCompleted === Math.min(currentWeek, 8) && currentWeek > 0
                      }).length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg shadow-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Users with &lt;50% Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {
                      users.filter((u) => {
                        const currentCycle = u.cycles && u.cycles.length > 0 ? u.cycles[u.cycles.length - 1] : null
                        const currentWeek = currentCycle?.currentWeek || 0
                        return currentWeek > 0 && u.collectionsCompleted / Math.min(currentWeek, 8) < 0.5
                      }).length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-lg shadow-black/5 overflow-hidden">
              <CardHeader>
                <CardTitle>By Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-semibold">Contract</TableHead>
                      <TableHead className="font-semibold">Active Users</TableHead>
                      <TableHead className="font-semibold">Avg Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uptakeData.map((data, i) => (
                      <TableRow key={i} className="hover:bg-muted/30 border-border/50">
                        <TableCell className="font-medium">{data.contract}</TableCell>
                        <TableCell>{data.activeUsers}</TableCell>
                        <TableCell>{data.attendance}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Platform User Dialog Component
function PlatformUserDialog({
  user,
  onSave,
  children,
  contracts,
  pantries,
}: {
  user?: PlatformUser
  onSave: () => void
  children: React.ReactNode
  contracts: Contract[]
  pantries: Pantry[]
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<PlatformUser>>(
    user || {
      name: "",
      email: "",
      role: "fww",
      organization: "",
      assignedContractIds: [],
      assignedPantryIds: [],
    },
  )

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Email, Role)",
        variant: "destructive",
      })
      return
    }

    const newUser: PlatformUser = {
      ...formData,
      id: user?.id || `user_${Date.now()}`,
    } as PlatformUser

    savePlatformUser(newUser)
    toast({
      title: "Success",
      description: `Platform user ${user ? "updated" : "created"} successfully`,
    })
    setOpen(false)
    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit Platform User" : "Create New Platform User"}</DialogTitle>
          <DialogDescription>{user ? "Update user details" : "Add a new platform user"}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Name *</Label>
              <Input
                id="userName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userEmail">Email *</Label>
              <Input
                id="userEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="userRole">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {/* Updated "Food Worker" to "Family Wellbeing Worker" */}
                  <SelectItem value="fww">Family Wellbeing Worker (FWW)</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userOrganization">Organization</Label>
              <Input
                id="userOrganization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
          </div>

          {formData.role === "fww" && (
            <div className="grid gap-2">
              <Label>Assigned Contracts</Label>
              <p className="text-sm text-muted-foreground">Select contracts this FWW can refer users to.</p>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                {contracts.map((contract) => (
                  <label key={contract.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignedContractIds?.includes(contract.id) || false}
                      onChange={(e) => {
                        const current = formData.assignedContractIds || []
                        setFormData({
                          ...formData,
                          assignedContractIds: e.target.checked
                            ? [...current, contract.id]
                            : current.filter((id) => id !== contract.id),
                        })
                      }}
                    />
                    <span className="text-sm">{contract.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.role === "coordinator" && (
            <div className="grid gap-2">
              <Label>Assigned Pantries</Label>
              <p className="text-sm text-muted-foreground">Select pantries this coordinator manages.</p>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                {pantries.map((pantry) => (
                  <label key={pantry.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignedPantryIds?.includes(pantry.id) || false}
                      onChange={(e) => {
                        const current = formData.assignedPantryIds || []
                        setFormData({
                          ...formData,
                          assignedPantryIds: e.target.checked
                            ? [...current, pantry.id]
                            : current.filter((id) => id !== pantry.id),
                        })
                      }}
                    />
                    <span className="text-sm">{pantry.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{user ? "Update" : "Create"} Platform User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateReferralDialog({
  onSave,
  children,
  contracts,
  pantries,
  platformUsers,
}: {
  onSave: () => void
  children: React.ReactNode
  contracts: Contract[]
  pantries: Pantry[]
  platformUsers: PlatformUser[]
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    adults: 1,
    childrenUnder5: 0,
    children6to12: 0,
    children13to18: 0,
    dietaryRequirements: "",
    contractId: "",
    pantryId: "",
    fwwId: "", // Optional assignment to FWW
    accessibilityFlag: false,
  })

  const totalHousehold = formData.adults + formData.childrenUnder5 + formData.children6to12 + formData.children13to18

  const selectedContract = contracts.find((c) => c.id.toString() === formData.contractId)
  const eligiblePantries = selectedContract
    ? pantries.filter((p) => selectedContract.eligiblePantryIds?.includes(p.id))
    : []

  const fwws = platformUsers.filter((u) => u.role === "fww")

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.contractId || !formData.pantryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newReferral: Referral = {
      id: referralId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email || undefined,
      familyComposition: {
        adults: formData.adults,
        childrenUnder5: formData.childrenUnder5,
        children6to12: formData.children6to12,
        children13to18: formData.children13to18,
        totalHousehold,
      },
      dietaryRequirements: formData.dietaryRequirements || undefined,
      accessibilityFlag: formData.accessibilityFlag,
      pantryId: Number.parseInt(formData.pantryId, 10),
      fwwId: formData.fwwId ? Number.parseInt(formData.fwwId, 10) : 1, // Default to first FWW if not assigned
      cycles: [
        {
          contractId: Number.parseInt(formData.contractId, 10),
          cycleStartDate: new Date().toISOString(),
          cycleEndDate: new Date(
            Date.now() + (selectedContract?.cycleWeeks || 8) * 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          currentWeek: 1,
          status: "active",
        },
      ],
      trackingUrl: `/track/${referralId}`,
      collectionsCompleted: 0,
      collections: [],
      createdAt: new Date().toISOString(),
      createdBy: "Admin",
    }

    saveReferral(newReferral)

    toast({
      title: "Success",
      description: "Referral created successfully",
    })

    setOpen(false)
    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Referral</DialogTitle>
          <DialogDescription>Add a new referral to the system</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Family Composition *</Label>
            <div className="grid grid-cols-4 gap-2">
              <div className="grid gap-1">
                <Label htmlFor="adults" className="text-xs">
                  Adults
                </Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: Number.parseInt(e.target.value, 10) || 1 })}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="childrenUnder5" className="text-xs">
                  Under 5
                </Label>
                <Input
                  id="childrenUnder5"
                  type="number"
                  min="0"
                  value={formData.childrenUnder5}
                  onChange={(e) =>
                    setFormData({ ...formData, childrenUnder5: Number.parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="children6to12" className="text-xs">
                  6-12 years
                </Label>
                <Input
                  id="children6to12"
                  type="number"
                  min="0"
                  value={formData.children6to12}
                  onChange={(e) =>
                    setFormData({ ...formData, children6to12: Number.parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="children13to18" className="text-xs">
                  13-18 years
                </Label>
                <Input
                  id="children13to18"
                  type="number"
                  min="0"
                  value={formData.children13to18}
                  onChange={(e) =>
                    setFormData({ ...formData, children13to18: Number.parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total household: {totalHousehold} people</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dietaryRequirements">Dietary Requirements (Optional)</Label>
            <Input
              id="dietaryRequirements"
              value={formData.dietaryRequirements}
              onChange={(e) => setFormData({ ...formData, dietaryRequirements: e.target.value })}
              placeholder="e.g., Vegetarian, Vegan, Halal, Gluten-free"
            />
          </div>

          <div className="flex items-start gap-2 border rounded-lg p-3 bg-muted/50">
            <Checkbox
              id="accessibilityFlag"
              checked={formData.accessibilityFlag}
              onCheckedChange={(checked) => setFormData({ ...formData, accessibilityFlag: checked as boolean })}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="accessibilityFlag"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Accessibility needs (Internal use only)
              </label>
              <p className="text-sm text-muted-foreground">
                Flag this referral if they may require delivery or have accessibility considerations
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contractId">Contract *</Label>
            <Select
              value={formData.contractId}
              onValueChange={(value) => setFormData({ ...formData, contractId: value, pantryId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contract" />
              </SelectTrigger>
              <SelectContent>
                {contracts
                  .filter((c) => c.active)
                  .map((contract) => (
                    <SelectItem key={contract.id} value={contract.id.toString()}>
                      {contract.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {formData.contractId && (
            <div className="grid gap-2">
              <Label htmlFor="pantryId">Pantry *</Label>
              <Select
                value={formData.pantryId}
                onValueChange={(value) => setFormData({ ...formData, pantryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pantry" />
                </SelectTrigger>
                <SelectContent>
                  {eligiblePantries.map((pantry) => (
                    <SelectItem key={pantry.id} value={pantry.id.toString()}>
                      {pantry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="fwwId">Assign to FWW (Optional)</Label>
            <Select value={formData.fwwId} onValueChange={(value) => setFormData({ ...formData, fwwId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="No assignment (optional)" />
              </SelectTrigger>
              <SelectContent>
                {fwws.map((fww) => (
                  <SelectItem key={fww.id} value={fww.id.toString()}>
                    {fww.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Assign this referral to a Family Wellbeing Worker for ongoing management
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Referral</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
