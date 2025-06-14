/**
 * Custom token-based authentication service
 * This provides a fallback authentication mechanism when Supabase sessions fail
 */

import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

// Token storage keys
const TOKEN_KEY = "eve-care-auth-token"
const USER_KEY = "eve-care-auth-user"
const EXPIRY_KEY = "eve-care-auth-expiry"

// Token expiration time (24 hours)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000

/**
 * Store authentication data in localStorage and cookies
 */
export function storeAuthData(token: string, user: User): void {
  try {
    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(EXPIRY_KEY, (Date.now() + TOKEN_EXPIRY).toString())

    // Store in cookies for middleware access
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${TOKEN_EXPIRY / 1000}; SameSite=Lax`
    document.cookie = `${USER_KEY}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${
      TOKEN_EXPIRY / 1000
    }; SameSite=Lax`
    document.cookie = `${EXPIRY_KEY}=${Date.now() + TOKEN_EXPIRY}; path=/; max-age=${
      TOKEN_EXPIRY / 1000
    }; SameSite=Lax`
    
    console.log("Auth data stored successfully")
  } catch (error) {
    console.error("Failed to store auth data:", error)
  }
}

/**
 * Clear authentication data from localStorage and cookies
 */
export function clearAuthData(): void {
  try {
    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(EXPIRY_KEY)

    // Clear cookies
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
    document.cookie = `${USER_KEY}=; path=/; max-age=0; SameSite=Lax`
    document.cookie = `${EXPIRY_KEY}=; path=/; max-age=0; SameSite=Lax`
    
    console.log("Auth data cleared successfully")
  } catch (error) {
    console.error("Failed to clear auth data:", error)
  }
}

/**
 * Get stored authentication data from localStorage
 */
export function getStoredAuthData(): { token: string | null; user: User | null; isValid: boolean } {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)
    const expiryStr = localStorage.getItem(EXPIRY_KEY)

    if (!token || !userStr || !expiryStr) {
      return { token: null, user: null, isValid: false }
    }

    const expiry = parseInt(expiryStr, 10)
    const isValid = Date.now() < expiry

    if (!isValid) {
      clearAuthData()
      return { token: null, user: null, isValid: false }
    }

    return {
      token,
      user: JSON.parse(userStr) as User,
      isValid,
    }
  } catch (error) {
    console.error("Failed to get stored auth data:", error)
    return { token: null, user: null, isValid: false }
  }
}

/**
 * Verify if the user has admin access
 */
export async function verifyAdminAccess(userId: string): Promise<{
  isAdmin: boolean
  adminUser: any | null
  error: string | null
}> {
  try {
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("id, role, is_active, name")
      .eq("id", userId)

    if (error || !adminUser) {
      return {
        isAdmin: false,
        adminUser: null,
        error: "Admin Account not found!",
      }
    }

    if (!adminUser[0].is_active) {
      return {
        isAdmin: false,
        adminUser: null,
        error: "User account is deactivated",
      }
    }

    return {
      isAdmin: true,
      adminUser,
      error: null,
    }
  } catch (error: any) {
    return {
      isAdmin: false,
      adminUser: null,
      error: "Failed to verify admin access",
    }
  }
}

/**
 * Refresh the authentication token
 */
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error || !data.session || !data.user) {
      console.error("Failed to refresh auth token:", error)
      return false
    }
    
    storeAuthData(data.session.access_token, data.user)
    return true
  } catch (error) {
    console.error("Error refreshing auth token:", error)
    return false
  }
}
