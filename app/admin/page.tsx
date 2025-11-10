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
import { getContracts, getPantries, getUsers, getFWWs, saveContract, savePantry } from "@/lib/data-service"
import type { Contract, Pantry, User, FWW } from "@/lib/types"
import { format } from "date-fns"
import { Users, Building, FileText, TrendingUp, Plus, Search, Edit, Eye, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [pantries, setPantries] = useState<Pantry[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [fwws, setFWWs] = useState<FWW[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setContracts(getContracts())
    setPantries(getPantries())
    setUsers(getUsers())
    setFWWs(getFWWs())
  }

  const activeUsers = users.filter((u) => u.status === "active").length
  const overallAttendance =
    users.length > 0
      ? Math.round(
          (users.reduce((sum, u) => sum + u.collectionsCompleted / Math.min(u.currentWeek, 8), 0) / users.length) * 100,
        )
      : 0

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage contracts, pantries, and monitor the network</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="pantries">Pantries</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="fwws">FWWs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {users.filter((u) => u.status === "completed").length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contracts.length}</div>
                <p className="text-xs text-muted-foreground">{contracts.filter((c) => c.active).length} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pantries</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pantries.length}</div>
                <p className="text-xs text-muted-foreground">{pantries.filter((p) => p.active).length} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallAttendance}%</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ContractDialog onSave={loadData}>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Contract
                  </Button>
                </ContractDialog>
                <PantryDialog onSave={loadData}>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Pantry
                  </Button>
                </PantryDialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((user) => (
                      <div key={user.id} className="flex items-center text-sm">
                        <div className="flex-1">
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">Referred by {user.createdBy}</p>
                        </div>
                        <Badge variant="outline">{format(new Date(user.createdAt), "MMM d")}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ContractDialog onSave={loadData}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Contract
              </Button>
            </ContractDialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Users</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts
                  .filter(
                    (c) =>
                      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.organization.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.name}</TableCell>
                      <TableCell>{contract.organization}</TableCell>
                      <TableCell>
                        <Badge variant={contract.active ? "default" : "secondary"}>
                          {contract.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{contract.activeUsers}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(contract.startDate), "MMM d, yyyy")} -{" "}
                        {format(new Date(contract.endDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <ContractDialog contract={contract} onSave={loadData}>
                          <Button variant="ghost" size="sm">
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
        <TabsContent value="pantries" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pantries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <PantryDialog onSave={loadData}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Pantry
              </Button>
            </PantryDialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pantry Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Collection Days</TableHead>
                  <TableHead>Coordinator</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableRow key={pantry.id}>
                      <TableCell className="font-medium">{pantry.name}</TableCell>
                      <TableCell>{pantry.region}</TableCell>
                      <TableCell>{pantry.collectionDay}</TableCell>
                      <TableCell>{pantry.coordinator}</TableCell>
                      <TableCell>{pantry.weeklyCapacity}</TableCell>
                      <TableCell>
                        <Badge variant={pantry.active ? "default" : "secondary"}>
                          {pantry.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <PantryDialog pantry={pantry} onSave={loadData}>
                          <Button variant="ghost" size="sm">
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

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Pantry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collections</TableHead>
                  <TableHead>Current Week</TableHead>
                  <TableHead>FWW</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((u) => {
                    const matchesSearch =
                      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesStatus = filterStatus === "all" || u.status === filterStatus
                    return matchesSearch && matchesStatus
                  })
                  .map((user) => {
                    const contract = contracts.find((c) => c.id === user.contractId)
                    const pantry = pantries.find((p) => p.id === user.pantryId)
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-sm">{contract?.name}</TableCell>
                        <TableCell className="text-sm">{pantry?.name}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.collectionsCompleted}/{Math.min(user.currentWeek, 8)}
                        </TableCell>
                        <TableCell>Week {user.currentWeek}</TableCell>
                        <TableCell className="text-sm">{user.createdBy}</TableCell>
                        <TableCell>
                          <UserDetailDialog user={user} contract={contract} pantry={pantry}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </UserDetailDialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* FWWs Tab */}
        <TabsContent value="fwws" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Assigned Contracts</TableHead>
                  <TableHead>Total Referrals</TableHead>
                  <TableHead>Active Referrals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fwws.map((fww) => (
                  <TableRow key={fww.id}>
                    <TableCell className="font-medium">{fww.name}</TableCell>
                    <TableCell>{fww.email}</TableCell>
                    <TableCell>{fww.organization}</TableCell>
                    <TableCell>
                      {fww.assignedContracts
                        .map((id) => contracts.find((c) => c.id === id)?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </TableCell>
                    <TableCell>{fww.totalReferrals}</TableCell>
                    <TableCell>{fww.activeReferrals}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <ReportsSection users={users} contracts={contracts} pantries={pantries} fwws={fwws} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Contract Dialog Component
function ContractDialog({
  contract,
  onSave,
  children,
}: {
  contract?: Contract
  onSave: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Contract>>(
    contract || {
      name: "",
      organization: "",
      startDate: "",
      endDate: "",
      cycleLength: 8,
      frequency: "weekly",
      collectionDay: "",
      eligiblePantries: [],
      surveyUrl: "",
      active: true,
      totalUsers: 0,
      activeUsers: 0,
    },
  )

  const handleSave = () => {
    if (!formData.name || !formData.organization || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newContract: Contract = {
      ...formData,
      id: contract?.id || Date.now(),
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
          <div className="grid gap-2">
            <Label htmlFor="organization">Organization *</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
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
            <Label htmlFor="collectionDay">Collection Day</Label>
            <Select
              value={formData.collectionDay}
              onValueChange={(value) => setFormData({ ...formData, collectionDay: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
              </SelectContent>
            </Select>
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

// Pantry Dialog Component
function PantryDialog({
  pantry,
  onSave,
  children,
}: {
  pantry?: Pantry
  onSave: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Pantry>>(
    pantry || {
      name: "",
      address: "",
      region: "",
      collectionDay: "",
      collectionTime: "",
      coordinator: "",
      active: true,
      weeklyCapacity: 30,
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
      id: pantry?.id || Date.now(),
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
          <div className="grid gap-2">
            <Label htmlFor="region">Region *</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="collectionDay">Collection Days</Label>
              <Input
                id="collectionDay"
                value={formData.collectionDay}
                onChange={(e) => setFormData({ ...formData, collectionDay: e.target.value })}
                placeholder="e.g. Tuesday, Wednesday"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="collectionTime">Collection Time</Label>
              <Input
                id="collectionTime"
                value={formData.collectionTime}
                onChange={(e) => setFormData({ ...formData, collectionTime: e.target.value })}
                placeholder="e.g. 10:00 AM - 4:00 PM"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="coordinator">Coordinator Name</Label>
              <Input
                id="coordinator"
                value={formData.coordinator}
                onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Weekly Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.weeklyCapacity}
                onChange={(e) => setFormData({ ...formData, weeklyCapacity: Number.parseInt(e.target.value) })}
              />
            </div>
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
  user: User
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
                  <span className="text-muted-foreground">Family Size:</span> {user.familySize}
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
                <p>
                  <span className="text-muted-foreground">Cycle:</span>{" "}
                  {format(new Date(user.cycleStartDate), "MMM d, yyyy")} -{" "}
                  {format(new Date(user.cycleEndDate), "MMM d, yyyy")}
                </p>
                <p>
                  <span className="text-muted-foreground">Current Week:</span> Week {user.currentWeek} of 8
                </p>
                <p>
                  <span className="text-muted-foreground">Referred by:</span> {user.createdBy}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tracking URL</h3>
              <code className="text-sm bg-muted p-2 rounded block">
                {window.location.origin}
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
                {user.collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell>Week {collection.weekNumber}</TableCell>
                    <TableCell>{format(new Date(collection.expectedDate), "MMM d, yyyy")}</TableCell>
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
                ))}
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
  users: User[]
  contracts: Contract[]
  pantries: Pantry[]
  fwws: FWW[]
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
    const totalCollections = pantryUsers.reduce((sum, u) => sum + u.collections.length, 0)
    const collected = pantryUsers.reduce(
      (sum, u) => sum + u.collections.filter((c) => c.status === "collected").length,
      0,
    )
    const noShows = pantryUsers.reduce((sum, u) => sum + u.collections.filter((c) => c.status === "no-show").length, 0)
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
    const contractUsers = users.filter((u) => u.contractId === contract.id)
    const totalCollections = contractUsers.reduce((sum, u) => sum + u.collections.length, 0)
    const collected = contractUsers.reduce(
      (sum, u) => sum + u.collections.filter((c) => c.status === "collected").length,
      0,
    )
    const noShows = contractUsers.reduce(
      (sum, u) => sum + u.collections.filter((c) => c.status === "no-show").length,
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
    return {
      fww: fww.name,
      referrals: fwwUsers.length,
      contracts: [...new Set(fwwUsers.map((u) => u.contractId))].length,
      mostRecent:
        fwwUsers.length > 0
          ? format(new Date(Math.max(...fwwUsers.map((u) => new Date(u.createdAt).getTime()))), "MMM d, yyyy")
          : "N/A",
    }
  })

  // Calculate uptake report data
  const uptakeData = contracts.map((contract) => {
    const contractUsers = users.filter((u) => u.contractId === contract.id)
    const totalCollections = contractUsers.reduce((sum, u) => sum + u.collections.length, 0)
    const collected = contractUsers.reduce(
      (sum, u) => sum + u.collections.filter((c) => c.status === "collected").length,
      0,
    )
    const attendance = totalCollections > 0 ? Math.round((collected / totalCollections) * 100) : 0

    return {
      contract: contract.name,
      activeUsers: contractUsers.filter((u) => u.status === "active").length,
      attendance,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={reportType} onValueChange={(v) => setReportType(v as any)} className="w-full">
          <TabsList>
            <TabsTrigger value="collections">Collections Report</TabsTrigger>
            <TabsTrigger value="referrals">Referrals Report</TabsTrigger>
            <TabsTrigger value="uptake">Uptake Report</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleExport}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Collections Report */}
          <TabsContent value="collections" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{collectionsData.reduce((sum, d) => sum + d.collected, 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      collectionsData.reduce((sum, d) => sum + d.attendance, 0) / Math.max(collectionsData.length, 1),
                    )}
                    %
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total No-Shows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{collectionsData.reduce((sum, d) => sum + d.noShows, 0)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>By Pantry</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pantry Name</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>No-Shows</TableHead>
                      <TableHead>Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collectionsData.map((data, i) => (
                      <TableRow key={i}>
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

            <Card>
              <CardHeader>
                <CardTitle>By Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract Name</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>No-Shows</TableHead>
                      <TableHead>Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractCollections.map((data, i) => (
                      <TableRow key={i}>
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
          <TabsContent value="referrals" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active FWWs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{fwws.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contracts.filter((c) => c.active).length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>By FWW</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>FWW Name</TableHead>
                      <TableHead>Referrals Created</TableHead>
                      <TableHead>Contracts Used</TableHead>
                      <TableHead>Most Recent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralsData.map((data, i) => (
                      <TableRow key={i}>
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
          <TabsContent value="uptake" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(uptakeData.reduce((sum, d) => sum + d.attendance, 0) / Math.max(uptakeData.length, 1))}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Users with 100% Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      users.filter((u) => u.collectionsCompleted === Math.min(u.currentWeek, 8) && u.currentWeek > 0)
                        .length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Users with &lt;50% Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      users.filter(
                        (u) => u.currentWeek > 0 && u.collectionsCompleted / Math.min(u.currentWeek, 8) < 0.5,
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>By Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract</TableHead>
                      <TableHead>Active Users</TableHead>
                      <TableHead>Avg Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uptakeData.map((data, i) => (
                      <TableRow key={i}>
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
