"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, User } from "lucide-react"

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    profile_image_url?: string
    doctor?: {
      title: string
      specialization: string
      bio: string
      years_experience: number
      contact_phone: string
    }
  }
  onUpdate: (updates: any) => Promise<void>
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    profile_image_url: user.profile_image_url || "",
    doctorData: user.doctor
      ? {
          title: user.doctor.title,
          specialization: user.doctor.specialization,
          bio: user.doctor.bio || "",
          years_experience: user.doctor.years_experience || 0,
          contact_phone: user.doctor.contact_phone || "",
        }
      : null,
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", "profiles")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { data } = await response.json()
      setFormData((prev) => ({ ...prev, profile_image_url: data.url }))
    } catch (error) {
      console.error("Error uploading image:", error)
      setMessage("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      await onUpdate(formData)
      setMessage("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information and profile settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Profile Image */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.profile_image_url || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {uploading ? "Uploading..." : "Change Photo"}
                    </span>
                  </Button>
                </Label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground mt-1">Email cannot be changed. Contact admin if needed.</p>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Doctor-specific fields */}
            {user.role === "doctor" && formData.doctorData && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Medical Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.doctorData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          doctorData: { ...formData.doctorData!, title: e.target.value },
                        })
                      }
                      placeholder="Dr., MD, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.doctorData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          doctorData: { ...formData.doctorData!, specialization: e.target.value },
                        })
                      }
                      placeholder="Gynecology, Obstetrics, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      value={formData.doctorData.years_experience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          doctorData: {
                            ...formData.doctorData!,
                            years_experience: Number.parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.doctorData.contact_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          doctorData: { ...formData.doctorData!, contact_phone: e.target.value },
                        })
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.doctorData.bio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        doctorData: { ...formData.doctorData!, bio: e.target.value },
                      })
                    }
                    placeholder="Tell us about your background and expertise..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
