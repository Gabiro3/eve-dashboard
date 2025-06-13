"use client"

import { useEffect, useState } from "react"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import { WriterDashboard } from "@/components/dashboard/writer-dashboard"
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (profile) {
          setUser(profile)
          toast({
            title: `Welcome, ${profile.name}`,
            description: `You're logged in as a ${profile.role}`,
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, toast])

  const renderDashboard = () => {
    if (!user) return null

    switch (user.role) {
      case "admin":
        return <AdminDashboard />
      case "writer":
        return <WriterDashboard user={user} />
      case "doctor":
        return <DoctorDashboard user={user} />
      default:
        return <AdminDashboard />
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">{renderDashboard()}</div>
    </DashboardLayout>
  )
}
