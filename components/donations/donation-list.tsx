"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Search, Plus, Edit, Trash2, Eye, DollarSign } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow, format } from "date-fns"
import { Donation, DonationFormData, DonationUpdateData } from "./types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { DonationCauseDialog } from "./donation-cause-dialog"

interface DonationListProps {
  donations: Donation[]
  userRole: string
  onCreate: (data: DonationFormData) => Promise<void>
  onUpdate: (id: string, data: DonationUpdateData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function DonationList({ donations, userRole, onCreate, onUpdate, onDelete }: DonationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateAmountDialog, setShowUpdateAmountDialog] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [newAmount, setNewAmount] = useState<number>(0)
  
  const [newDonation, setNewDonation] = useState<DonationFormData>({
    title: "",
    description: "",
    impactDetails: "",
    fundraisingGoal: 0,
    targetDate: new Date().toISOString().split("T")[0]
  })
  
  const [editDonation, setEditDonation] = useState<DonationUpdateData>({
    title: "",
    description: "",
    impact_details: "",
    fundraising_goal: 0,
    target_date: "",
    is_active: true
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch = donation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && donation.is_active) ||
                         (statusFilter === "inactive" && !donation.is_active)
    
    return matchesSearch && matchesStatus
  })

  const handleCreateDonation = async () => {
    await onCreate({
      ...newDonation,
      imageFile: selectedFile || undefined
    })
    setShowCreateDialog(false)
    resetNewDonation()
  }
  
  const handleViewDonation = (donation: Donation) => {
    setSelectedDonation(donation)
    setShowViewDialog(true)
  }
  
  const handleEditClick = (donation: Donation) => {
    setSelectedDonation(donation)
    setEditDonation({
      title: donation.title,
      description: donation.description,
      impact_details: donation.impact_details,
      fundraising_goal: donation.fundraising_goal,
      target_date: donation.target_date.split("T")[0],
      is_active: donation.is_active
    })
    setShowEditDialog(true)
  }
  
  const handleDeleteClick = (donation: Donation) => {
    setSelectedDonation(donation)
    setShowDeleteDialog(true)
  }
  
  const handleUpdateAmountClick = (donation: Donation) => {
    setSelectedDonation(donation)
    setNewAmount(donation.current_amount)
    setShowUpdateAmountDialog(true)
  }
  
  const handleUpdateDonation = async () => {
    if (!selectedDonation) return
    
    await onUpdate(selectedDonation.id, {
      ...editDonation,
      imageFile: editSelectedFile || undefined
    })
    setShowEditDialog(false)
  }
  
  const handleDeleteDonation = async () => {
    if (!selectedDonation) return
    
    await onDelete(selectedDonation.id)
    setShowDeleteDialog(false)
  }
  
  const handleUpdateAmount = async () => {
    if (!selectedDonation) return
    
    await onUpdate(selectedDonation.id, {
      current_amount: newAmount
    })
    setShowUpdateAmountDialog(false)
  }
  
  const handleToggleActive = async (donation: Donation) => {
    await onUpdate(donation.id, {
      is_active: !donation.is_active
    })
  }
  
  const resetNewDonation = () => {
    setNewDonation({
      title: "",
      description: "",
      impactDetails: "",
      fundraisingGoal: 0,
      targetDate: new Date().toISOString().split("T")[0]
    })
    setSelectedFile(null)
  }
  
  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100)
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Donation Causes</CardTitle>
              <CardDescription>Manage fundraising campaigns and donation causes</CardDescription>
            </div>
            {userRole === "admin" && (
  <DonationCauseDialog
    onSuccess={() => {
      setShowCreateDialog(false)
      resetNewDonation()
    }}
    trigger={
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Create Cause
      </Button>
    }
  />
)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search donations..."
                  className="h-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No donation causes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">{donation.title}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={getProgressPercentage(donation.current_amount, donation.fundraising_goal)} />
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(donation.current_amount)} of {formatCurrency(donation.fundraising_goal)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(donation.target_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={donation.is_active ? "default" : "secondary"}>
                          {donation.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDonation(donation)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {userRole === "admin" && (
                              <>
                                <DropdownMenuItem onClick={() => handleUpdateAmountClick(donation)}>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Update Amount
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(donation)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(donation)}>
                                  <Switch className="mr-2" checked={donation.is_active} />
                                  {donation.is_active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(donation)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Donation Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedDonation?.title}</DialogTitle>
            <DialogDescription>
              Created {selectedDonation && formatDistanceToNow(new Date(selectedDonation.created_at), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-6">
              {selectedDonation.background_image_url && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img 
                    src={selectedDonation.background_image_url} 
                    alt={selectedDonation.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedDonation.description}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Impact Details</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedDonation.impact_details}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Fundraising Progress</h3>
                <Progress value={getProgressPercentage(selectedDonation.current_amount, selectedDonation.fundraising_goal)} />
                <div className="flex justify-between text-sm">
                  <span>{formatCurrency(selectedDonation.current_amount)}</span>
                  <span className="text-muted-foreground">Goal: {formatCurrency(selectedDonation.fundraising_goal)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Target Date</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedDonation.target_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge variant={selectedDonation.is_active ? "default" : "secondary"}>
                    {selectedDonation.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Donation Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Donation Cause</DialogTitle>
            <DialogDescription>Update the details of this donation cause</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editDonation.title}
                onChange={(e) => setEditDonation({ ...editDonation, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editDonation.description}
                onChange={(e) => setEditDonation({ ...editDonation, description: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">
                Cover Image
              </Label>
              <div className="col-span-3">
                {selectedDonation?.background_image_url && !editSelectedFile && (
                  <div className="mb-2 relative w-full h-32 rounded-lg overflow-hidden">
                    <img 
                      src={selectedDonation.background_image_url} 
                      alt="Current cover"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-impactDetails" className="text-right">
                Impact Details
              </Label>
              <Textarea
                id="edit-impactDetails"
                value={editDonation.impact_details}
                onChange={(e) => setEditDonation({ ...editDonation, impact_details: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fundraisingGoal" className="text-right">
                Fundraising Goal
              </Label>
              <Input
                id="edit-fundraisingGoal"
                type="number"
                value={editDonation.fundraising_goal}
                onChange={(e) => setEditDonation({ ...editDonation, fundraising_goal: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-targetDate" className="text-right">
                Target Date
              </Label>
              <Input
                id="edit-targetDate"
                type="date"
                value={editDonation.target_date}
                onChange={(e) => setEditDonation({ ...editDonation, target_date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isActive" className="text-right">
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch 
                  id="edit-isActive" 
                  checked={editDonation.is_active} 
                  onCheckedChange={(checked) => setEditDonation({ ...editDonation, is_active: checked })}
                />
                <Label htmlFor="edit-isActive">
                  {editDonation.is_active ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateDonation}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this donation cause? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting this donation cause will permanently remove all associated data.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDonation}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Amount Dialog */}
      <Dialog open={showUpdateAmountDialog} onOpenChange={setShowUpdateAmountDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Donation Amount</DialogTitle>
            <DialogDescription>
              Update the current amount raised for this donation cause
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-amount">Current Amount</Label>
                <Input
                  id="current-amount"
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value))}
                />
              </div>
              {selectedDonation && (
                <div className="text-sm text-muted-foreground">
                  Fundraising Goal: {formatCurrency(selectedDonation.fundraising_goal)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateAmountDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateAmount}>Update Amount</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
