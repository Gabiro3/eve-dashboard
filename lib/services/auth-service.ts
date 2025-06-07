import { getSupabaseClient } from "@/lib/supabase-client"
import type { PharmacyUser, Pharmacy } from "@/lib/auth/types"

// Generate random password
export function generateRandomPassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Generate pharmacy code
export function generatePharmacyCode(): string {
  const digits = Math.floor(10000 + Math.random() * 90000)
  return `PH-${digits}`
}

// Verify pharmacy code
export async function verifyPharmacyCode(pharmacyCode: string): Promise<Pharmacy | null> {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase.from("pharmacies").select("*").eq("pharmacy_code", pharmacyCode).single()

    if (error) {
      console.error("Error verifying pharmacy code:", error)
      return null
    }

    return data as Pharmacy
  } catch (error) {
    console.error("Error in verifyPharmacyCode:", error)
    return null
  }
}

// Create new user
export async function createUser(userData: {
  email: string
  full_name: string
  role: string
  pharmacy_id: string
  phone?: string
  created_by: string
}): Promise<{ user: PharmacyUser | null; password: string | null; error: string | null }> {
  const supabase = getSupabaseClient()

  try {
    // Generate random password
    const password = generateRandomPassword()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
        pharmacy_id: userData.pharmacy_id,
      },
    })

    if (authError) {
      return { user: null, password: null, error: authError.message }
    }

    if (!authData.user) {
      return { user: null, password: null, error: "Failed to create user" }
    }

    // Create user in users table
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        pharmacy_id: userData.pharmacy_id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_admin: userData.role === "ADMIN",
        phone: userData.phone,
        is_active: true,
        created_by: userData.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (userError) {
      // Cleanup auth user if database insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { user: null, password: null, error: userError.message }
    }

    // Create pharmacy role
    const { error: roleError } = await supabase.from("pharmacy_roles").insert({
      user_id: authData.user.id,
      pharmacy_id: userData.pharmacy_id,
      role: userData.role,
      permissions: getDefaultPermissions(userData.role),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (roleError) {
      console.error("Error creating pharmacy role:", roleError)
      // Continue anyway, role can be created later
    }

    return { user: userRecord as PharmacyUser, password, error: null }
  } catch (error: any) {
    return { user: null, password: null, error: error.message }
  }
}

// Get users for pharmacy
export async function getPharmacyUsers(pharmacyId: string): Promise<PharmacyUser[]> {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("pharmacy_id", pharmacyId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching pharmacy users:", error)
      return []
    }

    return data as PharmacyUser[]
  } catch (error) {
    console.error("Error in getPharmacyUsers:", error)
    return []
  }
}

// Update user
export async function updateUser(
  userId: string,
  updates: Partial<PharmacyUser>,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Deactivate user
export async function deactivateUser(userId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = getSupabaseClient()

  try {
    // Update user status
    const { error: userError } = await supabase
      .from("users")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (userError) {
      return { success: false, error: userError.message }
    }

    // Optionally disable auth user
    // Note: This requires admin privileges
    // await supabase.auth.admin.updateUserById(userId, { ban_duration: "876000h" })

    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get default permissions based on role
function getDefaultPermissions(role: string) {
  switch (role) {
    case "ADMIN":
      return {
        medicines: ["create", "read", "update", "delete"],
        categories: ["create", "read", "update", "delete"],
        prescriptions: ["create", "read", "update", "delete"],
        sales: ["create", "read", "update", "delete"],
        reports: ["read"],
        users: ["create", "read", "update", "delete"],
        budget: ["create", "read", "update", "delete"],
        procurement: ["create", "read", "update", "delete"],
      }
    case "PHARMACIST":
      return {
        medicines: ["read", "update"],
        categories: ["read"],
        prescriptions: ["create", "read", "update"],
        sales: ["create", "read", "update"],
        reports: ["read"],
        users: [],
        budget: ["read"],
        procurement: ["read"],
      }
    case "CASHIER":
      return {
        medicines: ["read"],
        categories: ["read"],
        prescriptions: ["read"],
        sales: ["create", "read"],
        reports: [],
        users: [],
        budget: [],
        procurement: [],
      }
    default:
      return {
        medicines: ["read"],
        categories: ["read"],
        prescriptions: [],
        sales: [],
        reports: [],
        users: [],
        budget: [],
        procurement: [],
      }
  }
}
