"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface Announcement {
  id: string
  title: string
  content: string
  type: "general" | "maintenance" | "update" | "alert"
  created_at: string
  created_by: string
  is_active: boolean
}

export default function AnnouncementsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"general" | "maintenance" | "update" | "alert">("general")
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/login")
        return
      }

      // Get admin profile
      const { data: profile } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (!profile) {
        router.push("/dashboard")
        return
      }

      setUser(profile)
      await loadAnnouncements()
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error("Error loading announcements:", error)
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      })
    }
  }

  const handleCreateAnnouncement = async () => {
  if (!title || !content) {
    toast({
      title: "Missing fields",
      description: "Please fill in all required fields",
      variant: "destructive",
    })
    return
  }

  setSubmitting(true)

  try {
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        type, // e.g. "info"
        target_audience: "all", // Optional: "all", "doctors", or "patients"
        expires_at: null, // Optional
      }),
    })

    const result = await res.json()

    if (!res.ok) throw new Error(result.error || "Unknown error")

    toast({
      title: "Success",
      description: "Announcement created successfully",
    })

    // Reset form and close dialog
    setTitle("")
    setContent("")
    setShowCreateDialog(false)

    // Reload announcements
    await loadAnnouncements()
  } catch (error) {
    console.error("Error creating announcement:", error)
    toast({
      title: "Error",
      description: "Failed to create announcement",
      variant: "destructive",
    })
  } finally {
    setSubmitting(false)
  }
}

  const handleDeleteClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDeleteDialog(true)
  }

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return
    
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", selectedAnnouncement.id)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      })
      
      // Close dialog and reload announcements
      setShowDeleteDialog(false)
      await loadAnnouncements()
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      })
    }
  }

  const toggleAnnouncementStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !currentStatus })
        .eq("id", id)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: `Announcement ${currentStatus ? "deactivated" : "activated"} successfully`,
      })
      
      // Reload announcements
      await loadAnnouncements()
    } catch (error) {
      console.error("Error toggling announcement status:", error)
      toast({
        title: "Error",
        description: "Failed to update announcement status",
        variant: "destructive",
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "alert":
        return "destructive"
      case "maintenance":
        return "warning"
      case "update":
        return "secondary"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userRole={user?.role} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Announcements</h1>
                <p className="text-gray-500">Manage platform announcements for all users</p>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                    <DialogDescription>
                      Create a new announcement to be displayed to all users on the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter announcement title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={type} onValueChange={(value: any) => setType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="warning">Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write announcement content here"
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAnnouncement} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Announcement"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-6">
              {announcements.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-gray-500 mb-4">No announcements found</p>
                    <Button onClick={() => setShowCreateDialog(true)}>Create Announcement</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>All Announcements</CardTitle>
                    <CardDescription>
                      Total: {announcements.length} | Active: {announcements.filter(a => a.is_active).length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {announcements.map((announcement) => (
                            <TableRow key={announcement.id}>
                              <TableCell className="font-medium">{announcement.title}</TableCell>
                              <TableCell>
                                <Badge variant={getTypeColor(announcement.type) as any}>
                                  {announcement.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(new Date(announcement.created_at), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Badge variant={announcement.is_active ? "secondary" : "outline"}>
                                  {announcement.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAnnouncementStatus(announcement.id, announcement.is_active)}
                                  >
                                    {announcement.is_active ? "Deactivate" : "Activate"}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteClick(announcement)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Announcement Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {announcements
                  .filter(a => a.is_active)
                  .slice(0, 3)
                  .map((announcement) => (
                    <Card key={announcement.id} className="overflow-hidden">
                      <CardHeader className={`bg-${getTypeColor(announcement.type)}-50`}>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          <Badge variant={getTypeColor(announcement.type) as any}>
                            {announcement.type}
                          </Badge>
                        </div>
                        <CardDescription>
                          {format(new Date(announcement.created_at), "MMMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-gray-700 whitespace-pre-line">{announcement.content}</p>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 flex justify-between">
                        <span className="text-xs text-gray-500">
                          ID: {announcement.id.substring(0, 8)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteClick(announcement)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the announcement "{selectedAnnouncement?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAnnouncement} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
