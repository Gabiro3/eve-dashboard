"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mail, User, Phone, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "writer" as "writer" | "doctor",
    specialization: "",
    bio: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: "writer" | "doctor") => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Check if email already exists in auth
      const { data: existingUser } = await supabase.from("admin_users").select("id").eq("email", formData.email).single()

      if (existingUser) {
        throw new Error("An account with this email already exists.")
      }

      // Create account request
      const { error: requestError } = await supabase.from("account_requests").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        specialization: formData.role === "doctor" ? formData.specialization : null,
        bio: formData.bio,
        message: formData.message,
        status: "pending",
      })

      if (requestError) throw requestError

      setSuccess(true)
      toast({
        title: "Request submitted successfully",
        description: "We'll review your request and get back to you soon.",
        variant: "default",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Request Submitted!</CardTitle>
            <CardDescription className="text-center">
              Thank you for your interest in joining Eve Health. We'll review your request and get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">You'll be redirected to the login page shortly.</p>
            <Button asChild>
              <Link href="/login">Return to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                <Image
                  src="/logo.png"
                  alt="Eve Health Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">Eve Health</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Request Access</h2>
            <p className="mt-2 text-gray-600">Join our healthcare management platform</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create an account request</CardTitle>
              <CardDescription>
                Fill out the form below to request access as a writer or doctor. We'll review your request and get back
                to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === "doctor" && (
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      placeholder="E.g., Gynecology, Obstetrics"
                      value={formData.specialization}
                      onChange={handleChange}
                      required={formData.role === "doctor"}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself and your experience"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Why do you want to join?</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us why you'd like to join the platform"
                      value={formData.message}
                      onChange={handleChange}
                      className="pl-10"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Info Section */}
      <div className="flex-1 bg-[url('/images/login_bg.png')] bg-cover bg-center relative">
        {/* Pink gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#feebed]/90 via-[#ff5a7d]/60 to-[#a56957]/70 backdrop-blur-sm" />

        <div className="relative z-10 flex items-center justify-center p-8 h-full">
          <div className="text-center text-white max-w-md">
            <h1 className="text-4xl font-bold mb-4">Join Our Platform</h1>
            <p className="text-xl mb-8 text-pink-100">
              Help us empower reproductive health through education and comprehensive care
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Why Join Eve Health?</h3>
              <ul className="text-left space-y-3">
                <li className="flex items-start">
                  <div className="bg-white/20 p-1 rounded mr-2 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Share your expertise with a community that values reproductive health</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 p-1 rounded mr-2 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Contribute to educational content that makes a difference</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 p-1 rounded mr-2 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Connect with healthcare professionals and writers passionate about women's health</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
