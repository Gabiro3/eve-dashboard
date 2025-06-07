import { supabaseAdmin } from "@/lib/supabase"
import { createCachedFunction, CACHE_TAGS, CACHE_DURATIONS, invalidateCache } from "@/lib/cache"
import type { Database } from "@/types/database"

type User = Database["public"]["Tables"]["users"]["Row"]
type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

export class UserService {
  static getUsers = createCachedFunction(
    async (filters: { role?: string; is_active?: boolean } = {}) => {
      let query = supabaseAdmin
        .from("users")
        .select(`
          *,
          doctor:doctors(*)
        `)
        .order("created_at", { ascending: false })

      if (filters.role) {
        query = query.eq("role", filters.role)
      }
      if (filters.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    ["users"],
    [CACHE_TAGS.USERS],
    CACHE_DURATIONS.MEDIUM,
  )

  static async createUser(userData: {
    email: string
    password: string
    name: string
    role: "admin" | "writer" | "doctor"
    doctorData?: {
      title: string
      specialization: string
      bio?: string
      years_experience?: number
    }
  }) {
    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    })

    if (authError) throw authError

    let doctorId = null

    // If role is doctor, create doctor profile first
    if (userData.role === "doctor" && userData.doctorData) {
      const { data: doctor, error: doctorError } = await supabaseAdmin
        .from("doctors")
        .insert({
          name: userData.name,
          title: userData.doctorData.title,
          specialization: userData.doctorData.specialization,
          bio: userData.doctorData.bio,
          years_experience: userData.doctorData.years_experience,
          contact_email: userData.email,
        })
        .select()
        .single()

      if (doctorError) throw doctorError
      doctorId = doctor.id
    }

    // Create user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authUser.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        doctor_id: doctorId,
      })
      .select()
      .single()

    if (userError) throw userError

    await invalidateCache([CACHE_TAGS.USERS, CACHE_TAGS.DOCTORS])
    return user
  }

  static async updateUser(id: string, updates: UserUpdate) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await invalidateCache([CACHE_TAGS.USERS])
    return data
  }

  static async updateProfile(
    userId: string,
    updates: {
      name?: string
      profile_image_url?: string
      doctorData?: {
        title?: string
        specialization?: string
        bio?: string
        years_experience?: number
        contact_phone?: string
      }
    },
  ) {
    // Update user profile
    const userUpdates: UserUpdate = {}
    if (updates.name) userUpdates.name = updates.name
    if (updates.profile_image_url) userUpdates.profile_image_url = updates.profile_image_url

    if (Object.keys(userUpdates).length > 0) {
      const { error: userError } = await supabaseAdmin
        .from("users")
        .update({
          ...userUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (userError) throw userError
    }

    // Update doctor profile if provided
    if (updates.doctorData) {
      const { data: user } = await supabaseAdmin.from("users").select("doctor_id").eq("id", userId).single()

      if (user?.doctor_id) {
        const { error: doctorError } = await supabaseAdmin
          .from("doctors")
          .update({
            ...updates.doctorData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.doctor_id)

        if (doctorError) throw doctorError
      }
    }

    await invalidateCache([CACHE_TAGS.USERS, CACHE_TAGS.DOCTORS])
  }

  static async deactivateUser(id: string) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ is_active: false })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Also disable auth user
    await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: "none" })

    await invalidateCache([CACHE_TAGS.USERS])
    return data
  }
}
