"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Search, CheckCircle, XCircle, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AccessRequest {
  id: string
  name: string
  email: string
  role: "writer" | "doctor"
  specialization: string | null
  bio: string | null
  message: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [statusFilter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      let query = supabase.from("account_requests").select("*")

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error("Error loading access requests:", error)
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (request: AccessRequest) => {
    setSelectedRequest(request)
    setViewDetailsOpen(true)
  }

  const handleApproveRequest = (request: AccessRequest) => {
    setSelectedRequest(request)
    setReviewNotes("")
    setPassword("")
    setApproveDialogOpen(true)
  }

  const handleRejectRequest = (request: AccessRequest) => {
    setSelectedRequest(request)
    setReviewNotes("")
    setRejectDialogOpen(true)
  }

  const confirmApprove = async () => {
    if (!selectedRequest) return

    try {
      // 1. Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: selectedRequest.email,
        password: password,
        email_confirm: true,
      })

      if (authError) throw authError

      // 2. Create doctor record if needed
      let doctorId = null
      if (selectedRequest.role === "doctor" && selectedRequest.specialization) {
        const { data: doctor, error: doctorError } = await supabase
          .from("doctors")
          .insert({
            name: selectedRequest.name,
            title: "Dr.",
            specialization: selectedRequest.specialization,
            bio: selectedRequest.bio,
            contact_email: selectedRequest.email,
          })
          .select()
          .single()

        if (doctorError) throw doctorError
        doctorId = doctor.id
      }

      // 3. Create user profile
      const { error: userError } = await supabase.from("admin_users").insert({
        id: authUser.user.id,
        email: selectedRequest.email,
        name: selectedRequest.name,
        role: selectedRequest.role,
        doctor_id: doctorId,
        is_active: true,
      })

      if (userError) throw userError

      // 4. Update request status
      const { error: updateError } = await supabase
        .from("account_requests")
        .update({
          status: "approved",
          review_notes: reviewNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id)

      if (updateError) throw updateError

      toast({
        title: "Request approved",
        description: `${selectedRequest.name} has been granted access as a ${selectedRequest.role}`,
        variant: "default",
      })

      setApproveDialogOpen(false)
      await loadRequests()
    } catch (error: any) {
      console.error("Error approving request:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const confirmReject = async () => {
    if (!selectedRequest) return

    try {
      const { error } = await supabase
        .from("account_requests")
        .update({
          status: "rejected",
          review_notes: reviewNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id)

      if (error) throw error

      toast({
        title: "Request rejected",
        description: `${selectedRequest.name}'s request has been rejected`,
        variant: "default",
      })

      setRejectDialogOpen(false)
      await loadRequests()
    } catch (error: any) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Eye, label: "Pending" },
      approved: { variant: "default" as const, icon: CheckCircle, label: "Approved" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
    }

    const config = variants[status as keyof typeof variants]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const filteredRequests = requests.filter((request) => {
    return (
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Access Requests</CardTitle>
              <CardDescription>Manage requests for dashboard access</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No access requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.name}</div>
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.role}
                      </Badge>
                      {request.specialization && (
                        <div className="text-xs text-muted-foreground mt-1">{request.specialization}</div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {request.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApproveRequest(request)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectRequest(request)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
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
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Review the access request information</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                  <p>{selectedRequest.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p>{selectedRequest.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
                  <p className="capitalize">{selectedRequest.role}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                {selectedRequest.specialization && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Specialization</h4>
                    <p>{selectedRequest.specialization}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
                <p className="mt-1 text-sm">{selectedRequest.bio || "No bio provided"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Message</h4>
                <p className="mt-1 text-sm">{selectedRequest.message || "No message provided"}</p>
              </div>

              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium text-muted-foreground">Request Date</h4>
                <p className="text-sm">
                  {new Date(selectedRequest.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={() => handleRejectRequest(selectedRequest)}>
                  Reject
                </Button>
                <Button onClick={() => handleApproveRequest(selectedRequest)}>Approve</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Access Request</DialogTitle>
            <DialogDescription>
              Create an account for {selectedRequest?.name} with the role of {selectedRequest?.role}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Set Initial Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The user will be able to change this password after logging in.
              </p>
            </div>
            <div>
              <label htmlFor="notes" className="text-sm font-medium">
                Review Notes (Optional)
              </label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this approval"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove} disabled={!password}>
              Approve & Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Access Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedRequest?.name}'s request
            </DialogDescription>
          </DialogHeader>
          <div>
            <label htmlFor="reject-notes" className="text-sm font-medium">
              Rejection Reason
            </label>
            <Textarea
              id="reject-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Explain why this request is being rejected"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
