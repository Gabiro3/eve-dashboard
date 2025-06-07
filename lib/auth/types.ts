import type { Session, User, AuthError } from "@supabase/supabase-js"

// Extend the User type to include role
export interface UserWithRole extends User {
  role?: string | undefined
  pharmacy_id?: string | null
  is_admin?: boolean
  full_name?: string
  profile_picture_url?: string | null
  phone?: string | undefined
  is_active?: boolean
  last_login?: string | null
}

export interface PharmacyUser {
  id: string
  pharmacy_id: string
  full_name: string
  email: string
  role: string
  is_admin: boolean
  profile_picture_url: string | null
  phone: string | null
  is_active: boolean
  last_login: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface UserActivityLog {
  id: string
  user_id: string
  pharmacy_id: string
  action: string
  resource_type: string
  resource_id: string | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface Pharmacy {
  id: string
  name: string
  pharmacy_code: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  logo_url: string
  currency: string
  tax_rate: number
  subscription_plan: string
  subscription_status: string
  created_at: string
  updated_at: string
}

// Define the shape of our auth context
export interface AuthContextType {
  user: UserWithRole | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}
