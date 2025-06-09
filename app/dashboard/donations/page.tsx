"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { DonationList } from "@/components/donations/donation-list"
import { Donation } from "@/components/donations/types"

export default function DonationsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [donations, setDonations] = useState<Donation[]>([])
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    checkUser()

    // Check for success message in URL
    const successMessage = searchParams.get("success")
    if (successMessage) {
      toast({
        title: "Success",
        description: decodeURIComponent(successMessage),
      })
    }
  }, [searchParams])

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
      await loadDonations()
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadDonations = async () => {
    try {
      const { data, error } = await supabase
        .from("donation_causes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setDonations(data || [])
    } catch (error) {
      console.error("Error loading donations:", error)
      toast({
        title: "Error",
        description: "Failed to load donation causes",
        variant: "destructive",
      })
    }
  }

  const handleCreateDonation = async (donationData: any) => {
    try {
      const { error } = await supabase.from("donation_causes").insert({
        ...donationData,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Donation cause created successfully",
      })

      await loadDonations()
    } catch (error) {
      console.error("Error creating donation:", error)
      toast({
        title: "Error",
        description: "Failed to create donation cause",
        variant: "destructive",
      })
    }
  }

  const handleUpdateDonation = async (id: string, donationData: any) => {
    try {
      const { error } = await supabase
        .from("donation_causes")
        .update(donationData)
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Donation cause updated successfully",
      })

      await loadDonations()
    } catch (error) {
      console.error("Error updating donation:", error)
      toast({
        title: "Error",
        description: "Failed to update donation cause",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDonation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("donation_causes")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Donation cause deleted successfully",
      })

      await loadDonations()
    } catch (error) {
      console.error("Error deleting donation:", error)
      toast({
        title: "Error",
        description: "Failed to delete donation cause",
        variant: "destructive",
      })
    }
  }

  const handleUpdateAmount = async (id: string, amount: number) => {
    try {
      const { error } = await supabase
        .from("donation_causes")
        .update({ current_amount: amount })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Donation amount updated successfully",
      })

      await loadDonations()
    } catch (error) {
      console.error("Error updating donation amount:", error)
      toast({
        title: "Error",
        description: "Failed to update donation amount",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("donation_causes")
        .update({ is_active: !isActive })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Donation cause ${isActive ? "deactivated" : "activated"} successfully`,
      })

      await loadDonations()
    } catch (error) {
      console.error("Error toggling donation status:", error)
      toast({
        title: "Error",
        description: "Failed to update donation status",
        variant: "destructive",
      })
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
              <h1 className="text-2xl font-bold">Donation Causes</h1>
            </div>
            
            <DonationList 
              donations={donations}
              onCreate={handleCreateDonation}
              onUpdate={handleUpdateDonation}
              onDelete={handleDeleteDonation}
              userRole={user?.role}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
