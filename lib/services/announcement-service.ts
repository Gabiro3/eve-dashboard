import { supabaseAdmin } from "@/lib/supabase"
import { createCachedFunction, CACHE_TAGS, CACHE_DURATIONS, invalidateCache } from "@/lib/cache"
import type { Database } from "@/types/database"

type Announcement = Database["public"]["Tables"]["announcements"]["Row"]
type AnnouncementInsert = Database["public"]["Tables"]["announcements"]["Insert"]
type AnnouncementUpdate = Database["public"]["Tables"]["announcements"]["Update"]

export class AnnouncementService {
  static getAnnouncements = createCachedFunction(
    async (
      filters: {
        is_active?: boolean
        target_audience?: string
        limit?: number
      } = {},
    ) => {
      let query = supabaseAdmin
        .from("announcements")
        .select(`
          *,
          creator:users!announcements_created_by_fkey(name)
        `)
        .order("created_at", { ascending: false })

      if (filters.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active)
      }
      if (filters.target_audience) {
        query = query.eq("target_audience", filters.target_audience)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    ["announcements"],
    [CACHE_TAGS.ANNOUNCEMENTS],
    CACHE_DURATIONS.MEDIUM,
  )

  static async createAnnouncement(announcement: AnnouncementInsert) {
    const { data, error } = await supabaseAdmin.from("announcements").insert(announcement).select().single()

    if (error) throw error

    await invalidateCache([CACHE_TAGS.ANNOUNCEMENTS])
    return data
  }

  static async updateAnnouncement(id: string, updates: AnnouncementUpdate) {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await invalidateCache([CACHE_TAGS.ANNOUNCEMENTS])
    return data
  }

  static async deleteAnnouncement(id: string) {
    const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id)

    if (error) throw error

    await invalidateCache([CACHE_TAGS.ANNOUNCEMENTS])
  }

  // Get active announcements for specific audience
  static getActiveAnnouncements = createCachedFunction(
    async (targetAudience: "all" | "doctors" | "patients" = "all") => {
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .or(`target_audience.eq.all,target_audience.eq.${targetAudience}`)
        .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
    ["active-announcements"],
    [CACHE_TAGS.ANNOUNCEMENTS],
    CACHE_DURATIONS.SHORT,
  )
}
