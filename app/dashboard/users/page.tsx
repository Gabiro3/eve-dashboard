"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { UserManagement } from "@/components/users/user-management"
import { supabase } from "@/lib/supabase"
import { User } from "@/lib/types"

// Define a custom user type that matches what the UserManagement component expects
interface DashboardUser {
  id: string
  name: string
  email: string
  role: "admin" | "writer" | "doctor"
  is_active: boolean
  created_at: string
  updated_at?: string
  profile_image_url?: string
  doctor?: {
    title: string
    specialization: string
  }
}

export default function UsersPage() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

      const { data: profile } = await supabase.from("admin_users").select("*").eq("id", authUser.id).single()

      if (profile) {
        if (profile.role !== "admin") {
          router.push("/dashboard")
          return
        }
        setUser(profile)
        await loadUsers()
      }
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      
      // Transform the data to match the expected DashboardUser structure
      const transformedUsers = (data || []).map((user: any) => ({
        id: user.id,
        name: user.full_name || user.name || '',
        email: user.email || '',
        role: user.role || 'writer',
        is_active: user.is_active !== undefined ? user.is_active : true,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at,
        profile_image_url: user.profile_image_url,
        doctor: user.doctor && user.doctor.length > 0 ? {
          title: user.doctor[0].title || '',
          specialization: user.doctor[0].specialization || ''
        } : undefined
      }));
      
      setUsers(transformedUsers)
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) throw new Error("Failed to create user")

      await loadUsers()
    } catch (error) {
      console.error("Error creating user:", error)
    }
  }

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const { error } = await supabase.from("users").update(updates).eq("id", userId)

      if (error) throw error
      await loadUsers()
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) throw error
      await loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <UserManagement
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
