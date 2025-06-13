"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { OverviewStats } from "@/components/dashboard/overview-stats"
import { TrafficChart } from "@/components/dashboard/traffic-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UserGrowthChart } from "@/components/dashboard/user-growth-chart"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { startOfMonth, subMonths, format } from "date-fns"
import { RecentPosts } from "@/components/dashboard/recent-posts"
import { UserRegistrationChart } from "@/components/dashboard/user-registration-chart"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [userRegistrationData, setUserRegistrationData] = useState<{ date: string; count: number }[]>([])
  interface DashboardStats {
    totalUsers: number;
    totalArticles: number;
    totalDonations: number;
    pendingRequests: number;
    myArticles?: number;
    pendingReviews?: number;
    publishedArticles?: number;
  }
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArticles: 0,
    totalDonations: 0,
    pendingRequests: 0
  })
  const [activities, setActivities] = useState<any[]>([])
  const [trafficData, setTrafficData] = useState({
    labels: [] as string[],
    values: [] as number[],
    currentValue: 0,
    trend: 0,
  })
  const [userGrowthData, setUserGrowthData] = useState<{ date: string; count: number }[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    checkUser()
    loadRecentPosts()
    loadUserRegistrationData()

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

      // Get user profile
      const { data: profile } = await supabase.from("admin_users").select("*").eq("id", authUser.id).single()

      if (profile) {
        setUser(profile)
        await loadDashboardData(profile.role)

        // Show welcome toast on first load
        toast({
          title: `Welcome, ${profile.name}`,
          description: `You're logged in as a ${profile.role}`,
        })
      }
    } catch (error) {
      console.error("Error checking user:", error)
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

  const loadDashboardData = async (role: string) => {
    try {
      // Fetch common data for all roles
      const [articlesRes, donationsRes, requestsRes] = await Promise.all([
        supabase.from("articles").select("id, created_at, status, author_id", { count: "exact" }),
        supabase.from("donation_causes").select("current_amount"),
        supabase.from("account_requests").select("id", { count: "exact" }).eq("status", "pending")
      ])

      // Fetch app users data
      const { data: usersData, count: usersCount, error: usersError } = await supabase
        .from("users")
        .select("id, created_at", { count: "exact" })

      if (usersError) throw usersError

      // Calculate total donations
      const totalDonations = donationsRes.data?.reduce(
        (sum, cause) => sum + (cause.current_amount || 0), 0
      ) || 0

      // Generate user growth data for the chart
      const userGrowth = generateUserGrowthData(usersData || [])
      setUserGrowthData(userGrowth)

      // Generate traffic data based on article reads
      const trafficLabels = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i)
        return format(date, 'MMM')
      })

      // For now, we'll use some calculated values based on the number of articles
      // In a real app, you'd fetch actual view/read counts
      const articleCount = articlesRes.data?.length || 0
      const baseTraffic = articleCount * 100
      const trafficValues = trafficLabels.map((_, i) => {
        return baseTraffic + (i * baseTraffic * 0.2) + Math.floor(Math.random() * baseTraffic * 0.3)
      })

      setTrafficData({
        labels: trafficLabels,
        values: trafficValues,
        currentValue: trafficValues[trafficValues.length - 1],
        trend: calculateTrend(trafficValues)
      })

      // Set basic stats for all roles
      const basicStats = {
        totalUsers: usersCount || 0,
        totalArticles: articlesRes.count || 0,
        totalDonations,
        pendingRequests: requestsRes.count || 0
      }

      // Add role-specific stats
      if (role === "admin") {
        // Admin already has all the stats they need in basicStats
        setStats(basicStats)

        // Fetch recent activities
        const { data: recentActivities } = await supabase
          .from("articles")
          .select("title, status, created_at, author:author_id(name)")
          .order("created_at", { ascending: false })
          .limit(5)

        setActivities(recentActivities || [])
      } else if (role === "writer") {
        // Writer stats
        const myArticles = articlesRes.data?.filter(a => a.author_id === user?.id).length || 0
        const pendingReviews = articlesRes.data?.filter(
          a => a.author_id === user?.id && a.status === "pending_review"
        ).length || 0
        const publishedArticles = articlesRes.data?.filter(
          a => a.author_id === user?.id && a.status === "approved"
        ).length || 0

        setStats({
          ...basicStats,
          myArticles,
          pendingReviews,
          publishedArticles
        })
      } else if (role === "doctor") {
        // Doctor stats
        const pendingReviews = articlesRes.data?.filter(a => a.status === "pending_review").length || 0
        const myArticles = articlesRes.data?.filter(a => a.author_id === user?.doctor_id).length || 0

        setStats({
          ...basicStats,
          pendingReviews,
          myArticles
        })
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    }
  }

  // Helper function to generate user growth data
  const generateUserGrowthData = (users: any[]) => {
    // Get the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      return startOfMonth(subMonths(new Date(), 5 - i))
    })

    // Count users created in each month
    const monthlyData = months.map((monthStart, index) => {
      const monthEnd = index < 5 ? months[index + 1] : new Date()
      
      // Count users created in this month
      const usersInMonth = users.filter(user => {
        const createdAt = new Date(user.created_at)
        return createdAt >= monthStart && createdAt < monthEnd
      }).length

      return {
        date: format(monthStart, 'MMM yyyy'),
        count: usersInMonth
      }
    })

    return monthlyData
  }

  const loadRecentPosts = async () => {
    try {
      let query = supabase
        .from("articles")
        .select(`
          *,
          author:admin_users(name, role),
          category:article_categories(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      // Filter based on user role
      if (user?.role === "writer") {
        query = query.eq("author_id", user.doctor_id)
      }

      const { data, error } = await query

      if (error) throw error
      setRecentPosts(data || [])
    } catch (error) {
      console.error("Error loading recent posts:", error)
    }
  }

  const loadUserRegistrationData = async () => {
    try {
      // Get user registrations for the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from("users")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true })

      if (error) throw error

      // Group by date
      const registrationsByDate = (data || []).reduce((acc: Record<string, number>, user) => {
        const date = new Date(user.created_at).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      // Convert to array format
      const registrationData = Object.entries(registrationsByDate).map(([date, count]) => ({
        date,
        count,
      }))

      setUserRegistrationData(registrationData)
    } catch (error) {
      console.error("Error loading user registration data:", error)
    }
  }
  // Helper function to calculate trend percentage
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0
    
    const current = values[values.length - 1]
    const previous = values[values.length - 2]
    
    if (previous === 0) return 100 // Avoid division by zero
    
    return Math.round(((current - previous) / previous) * 100)
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
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Hi {user.name.split(" ")[0]}, Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === "admin" && "Here's your platform overview and management dashboard."}
                {user.role === "writer" && "Track your article performance and writing statistics."}
                {user.role === "doctor" && "Review pending articles and manage your medical content."}
              </p>
            </div>

            {/* Stats Overview */}
            <OverviewStats userRole={user.role} stats={stats} />

            {/* Charts and Activity */}
            <div className="grid gap-6 md:grid-cols-3">
            <UserRegistrationChart
              data={userRegistrationData}
              title="User Registrations"
              description="New admin user registrations over time"
              period="30d"
            />
            <RecentPosts posts={recentPosts} userRole={user?.role || "writer"} />
          </div>
            
            {/* User Growth Chart */}
            <UserGrowthChart 
              data={userGrowthData} 
              title="User Growth" 
              description="New user registrations over the last 6 months" 
            />
          </div>
        </main>
      </div>
    </div>
  )
}
