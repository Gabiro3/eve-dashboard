"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, X, Loader2, Plus, Heart } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface DonationCauseFormData {
  title: string
  description: string
  cover_image_url: string
  target_amount: number
  target_impact: string
  location: string
  end_date: Date | undefined
  is_active: boolean
  category: string
  organizer_name: string
  ussd_code: string
}

interface DonationCauseDialogProps {
  onSuccess: () => void
  trigger?: React.ReactNode
}

const CATEGORIES = [
  "Healthcare",
  "Education",
  "Emergency Relief",
  "Community Development",
  "Women's Health",
  "Child Welfare",
  "Environmental",
  "Technology Access",
  "Other",
]

export function DonationCauseDialog({ onSuccess, trigger }: DonationCauseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<DonationCauseFormData>({
    title: "",
    description: "",
    cover_image_url: "",
    target_amount: 0,
    target_impact: "",
    location: "",
    end_date: undefined,
    is_active: true,
    category: "",
    organizer_name: "",
    ussd_code: "",
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `donations/${fileName}`

      const { error: uploadError } = await supabase.storage.from("donations").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("donations").getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, cover_image_url: publicUrl }))

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required"
    if (!formData.description.trim()) return "Description is required"
    if (formData.target_amount <= 0) return "Target amount must be greater than 0"
    if (!formData.organizer_name.trim()) return "Organizer name is required"
    if (!formData.category) return "Category is required"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from("donation_causes").insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        cover_image_url: formData.cover_image_url || null,
        target_amount: formData.target_amount,
        target_impact: formData.target_impact.trim() || null,
        location: formData.location.trim() || null,
        end_date: formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : null,
        is_active: formData.is_active,
        category: formData.category || null,
        organizer_name: formData.organizer_name.trim(),
        ussd_code: formData.ussd_code.trim() || null,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Donation cause created successfully",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        cover_image_url: "",
        target_amount: 0,
        target_impact: "",
        location: "",
        end_date: undefined,
        is_active: true,
        category: "",
        organizer_name: "",
        ussd_code: "",
      })

      setOpen(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error creating donation cause:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create donation cause",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Donation Cause
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Create New Donation Cause
          </DialogTitle>
          <DialogDescription>
            Create a new fundraising campaign to support important causes in reproductive health and community welfare.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a compelling campaign title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the cause, why it's important, and how donations will be used"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organizer">Organizer Name *</Label>
                <Input
                  id="organizer"
                  value={formData.organizer_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, organizer_name: e.target.value }))}
                  placeholder="Organization or person organizing"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Financial Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_amount">Target Amount (USD) *</Label>
                <Input
                  id="target_amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.target_amount || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, target_amount: Number.parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ussd_code">USSD Code (Optional)</Label>
                <Input
                  id="ussd_code"
                  value={formData.ussd_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ussd_code: e.target.value }))}
                  placeholder="e.g., *123*456#"
                />
              </div>
            </div>
          </div>

          {/* Impact and Location */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="target_impact">Expected Impact</Label>
              <Textarea
                id="target_impact"
                value={formData.target_impact}
                onChange={(e) => setFormData((prev) => ({ ...prev, target_impact: e.target.value }))}
                placeholder="Describe the expected impact of reaching the funding goal"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country or region where the cause is located"
              />
            </div>
          </div>

          {/* Campaign Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Campaign Settings</h4>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Select end date (optional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, end_date: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active Campaign</Label>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-4">
            <h4 className="font-medium">Cover Image</h4>

            {formData.cover_image_url && (
              <div className="relative">
                <img
                  src={formData.cover_image_url || "/placeholder.svg"}
                  alt="Cover image"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData((prev) => ({ ...prev, cover_image_url: "" }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="image-upload">Upload Cover Image</Label>
              <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading image...
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Recommended: 1200x600px, JPG or PNG, max 2MB</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Create Campaign
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
