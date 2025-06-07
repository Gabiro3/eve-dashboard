import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return null
    }

    // Get user details with pharmacy information
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        role,
        pharmacy_id,
        is_active,
        profile_picture_url,
        pharmacies:pharmacy_id (
          id,
          name,
          pharmacy_code
        )
      `)
      .eq("id", session.user.id)
      .single()

    if (userError || !userData) {
      return null
    }

    return {
      ...userData,
      is_admin: userData.role === "ADMIN",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
