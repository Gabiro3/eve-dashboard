import { supabaseAdmin } from "@/lib/supabase"
import { createCachedFunction, CACHE_TAGS, CACHE_DURATIONS, invalidateCache } from "@/lib/cache"
import type { Database } from "@/types/database"

type DonationCause = Database["public"]["Tables"]["donation_causes"]["Row"]
type DonationCauseInsert = Database["public"]["Tables"]["donation_causes"]["Insert"]
type DonationCauseUpdate = Database["public"]["Tables"]["donation_causes"]["Update"]

export class DonationService {
  static getDonationCauses = createCachedFunction(
    async (
      filters: {
        is_active?: boolean
        limit?: number
      } = {},
    ) => {
      let query = supabaseAdmin
        .from("donation_causes")
        .select(`
          *,
          creator:users!donation_causes_created_by_fkey(name)
        `)
        .order("created_at", { ascending: false })

      if (filters.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    ["donation-causes"],
    [CACHE_TAGS.DONATION_CAUSES],
    CACHE_DURATIONS.MEDIUM,
  )

  static async createDonationCause(cause: DonationCauseInsert) {
    const { data, error } = await supabaseAdmin.from("donation_causes").insert(cause).select().single()

    if (error) throw error

    await invalidateCache([CACHE_TAGS.DONATION_CAUSES])
    return data
  }

  static async updateDonationCause(id: string, updates: DonationCauseUpdate) {
    const { data, error } = await supabaseAdmin
      .from("donation_causes")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await invalidateCache([CACHE_TAGS.DONATION_CAUSES])
    return data
  }

  static async updateDonationAmount(id: string, amount: number) {
    const { data: cause } = await supabaseAdmin.from("donation_causes").select("current_amount").eq("id", id).single()

    if (!cause) throw new Error("Donation cause not found")

    const { data, error } = await supabaseAdmin
      .from("donation_causes")
      .update({
        current_amount: (cause.current_amount || 0) + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await invalidateCache([CACHE_TAGS.DONATION_CAUSES])
    return data
  }

  static async deleteDonationCause(id: string) {
    const { error } = await supabaseAdmin.from("donation_causes").delete().eq("id", id)

    if (error) throw error

    await invalidateCache([CACHE_TAGS.DONATION_CAUSES])
  }

  // Get active causes with progress
  static getActiveCausesWithProgress = createCachedFunction(
    async () => {
      const { data, error } = await supabaseAdmin
        .from("donation_causes")
        .select("*")
        .eq("is_active", true)
        .gte("target_date", new Date().toISOString())
        .order("target_date", { ascending: true })

      if (error) throw error

      return data?.map((cause) => ({
        ...cause,
        progress_percentage: Math.min(((cause.current_amount || 0) / cause.fundraising_goal) * 100, 100),
      }))
    },
    ["active-causes-progress"],
    [CACHE_TAGS.DONATION_CAUSES],
    CACHE_DURATIONS.SHORT,
  )
}
