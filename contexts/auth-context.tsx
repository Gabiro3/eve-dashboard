"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import { getStoredAuthData, storeAuthData, clearAuthData, refreshAuthToken, verifyAdminAccess } from "@/lib/auth/token-service"

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  adminData: AdminUser | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  adminData: null,
  signOut: async () => {},
  refreshSession: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminData, setAdminData] = useState<any | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check for stored authentication data
  const checkStoredAuth = async () => {
    const storedAuth = getStoredAuthData()
    
    if (storedAuth.isValid && storedAuth.user) {
      console.log("Found valid stored auth data")
      setUser(storedAuth.user)
      
      // Verify admin access
      const { isAdmin: hasAdminAccess, adminUser, error } = await verifyAdminAccess(storedAuth.user.id)
      
      if (hasAdminAccess && adminUser) {
        setIsAdmin(true)
        setAdminData(adminUser)
        return true
      } else if (error) {
        console.error("Admin verification failed:", error)
      }
    }
    
    return false
  }

  const refreshSession = async () => {
    try {
      setLoading(true)
      
      // First try to use stored auth data
      const hasValidStoredAuth = await checkStoredAuth()
      if (hasValidStoredAuth) {
        console.log("Using stored auth data")
        setLoading(false)
        return
      }
      
      // Otherwise try to refresh the Supabase session
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error refreshing session:", error)
        setLoading(false)
        return
      }
      
      if (data.session && data.session.user) {
        console.log("Session refreshed from Supabase")
        setSession(data.session)
        setUser(data.session.user)
        
        // Store the authentication data
        storeAuthData(data.session.access_token, data.session.user)
        
        // Verify admin access
        const { isAdmin: hasAdminAccess, adminUser } = await verifyAdminAccess(data.session.user.id)
        
        if (hasAdminAccess && adminUser) {
          setIsAdmin(true)
          setAdminData(adminUser)
        } else {
          // If not an admin, sign out
          await signOut()
        }
      } else {
        // Try to refresh the token as a last resort
        const tokenRefreshed = await refreshAuthToken()
        if (tokenRefreshed) {
          await refreshSession()
        }
      }
    } catch (error) {
      console.error("Failed to refresh session:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial session check
    refreshSession()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, !!newSession)
      
      if (newSession && newSession.user) {
        setSession(newSession)
        setUser(newSession.user)
        
        // Store the authentication data
        storeAuthData(newSession.access_token, newSession.user)
        
        // Verify admin access on sign in
        if (event === 'SIGNED_IN') {
          const { isAdmin: hasAdminAccess, adminUser } = await verifyAdminAccess(newSession.user.id)
          
          if (hasAdminAccess && adminUser) {
            setIsAdmin(true)
            setAdminData(adminUser)
            
            if (pathname === '/login') {
              console.log("User signed in, redirecting to dashboard")
              router.push('/dashboard')
            }
          } else {
            // If not an admin, sign out
            await signOut()
            router.push('/login')
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing auth data")
        setUser(null)
        setSession(null)
        setIsAdmin(false)
        setAdminData(null)
        clearAuthData()
        
        if (pathname !== '/login') {
          router.push('/login')
        }
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Error signing out:", error)
      }
      
      // Clear auth data regardless of Supabase signout success
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      setAdminData(null)
      clearAuthData()
      
      console.log("User signed out successfully")
    } catch (error) {
      console.error("Error during sign out:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isAdmin,
      adminData,
      signOut, 
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
