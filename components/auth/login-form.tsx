"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", { email })
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("Auth error during login:", authError)
        throw authError
      }

      // Verify the session was created
      if (!authData.session || !authData.user) {
        throw new Error("Failed to establish session. Please try again.")
      }

      // Import the token service
      const { storeAuthData, verifyAdminAccess } = await import('@/lib/auth/token-service')

      // Store authentication data
      storeAuthData(authData.session.access_token, authData.user)

      // Check if user exists in admin_users table and is active
      const { isAdmin, adminUser, error: adminError } = await verifyAdminAccess(authData.user.id)

      if (!isAdmin || !adminUser) {
        // If user doesn't have admin access
        await supabase.auth.signOut()
        
        // Import clearAuthData
        const { clearAuthData } = await import('@/lib/auth/token-service')
        clearAuthData()
        
        throw new Error(adminError || "You don't have access to the admin dashboard. Please request access.")
      }

      // Successful login
      toast({
        title: "Login successful",
        description: `Welcome back!`,
        variant: "default",
      })

      // Add a delay to ensure the session is properly set before redirect
      setTimeout(() => {
        console.log("Redirecting to dashboard")
        router.push("/dashboard")
      }, 800)
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message)
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
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
            <h2 className="text-3xl font-bold text-gray-900">Sign in to Admin Dashboard</h2>
            <p className="mt-2 text-gray-600">Access your healthcare management platform</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-primary hover:text-primary-foreground font-medium">
                      Request access
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Welcome Section */}
      <div className="flex-1 bg-[url('/images/login_bg.png')] bg-cover bg-center relative">
  {/* Overlay Gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#feebed]/90 via-[#ff5a7d]/60 to-[#a56957]/70 backdrop-blur-sm" />

  <div className="relative z-10 flex items-center justify-center p-8 h-full">
    <div className="text-center text-white max-w-md">
      <h1 className="text-4xl font-bold mb-4">Welcome to Eve Health Admin</h1>
      <p className="text-xl mb-8 text-pink-100">
        Empowering women's health through comprehensive care management and education
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-2xl font-bold">1000+</div>
            <div className="text-pink-100">Patients Served</div>
          </div>
          <div>
            <div className="text-2xl font-bold">50+</div>
            <div className="text-pink-100">Healthcare Providers</div>
          </div>
          <div>
            <div className="text-2xl font-bold">200+</div>
            <div className="text-pink-100">Articles Published</div>
          </div>
          <div>
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-pink-100">Support Available</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  )
}
