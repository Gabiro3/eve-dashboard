import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase-client"

// Cache keys
export const CACHE_KEYS = {
  SALES: "sales",
  PAYMENTS: "payments",
  PRODUCTS: "products",
  INVENTORY: "inventory",
  CATEGORIES: "categories",
  PHARMACY: "pharmacy",
  USER_PROFILE: "user-profile",
} as const

// Sales caching hooks
export function useSalesCache(filters?: {
  startDate?: string
  endDate?: string
  limit?: number
  currency?: string
}) {
  return useQuery({
    queryKey: [CACHE_KEYS.SALES, filters],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from("sales")
        .select(`
          *,
          sale_items(
            id,
            medicine_id,
            quantity,
            unit_price,
            total_price,
            medicines(id, name)
          ),
          patients(id, name)
        `)
        .order("created_at", { ascending: false })

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Payments caching hooks
export function usePaymentsCache(filters?: {
  startDate?: string
  endDate?: string
  status?: string
}) {
  return useQuery({
    queryKey: [CACHE_KEYS.PAYMENTS, filters],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from("sales")
        .select(`
          id,
          invoice_number,
          customer_name,
          total_amount,
          payment_method,
          payment_status,
          currency,
          created_at,
          patients(name)
        `)
        .order("created_at", { ascending: false })

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate)
      }
      if (filters?.status) {
        query = query.eq("payment_status", filters.status)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

// Products caching hooks
export function useProductsCache() {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("medicines")
        .select(`
          *,
          medicine_categories(id, name)
        `)
        .order("name", { ascending: true })

      if (error) throw error
      return data || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Inventory movements caching
export function useInventoryMovementsCache(medicineId?: string) {
  return useQuery({
    queryKey: [CACHE_KEYS.INVENTORY, "movements", medicineId],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from("inventory_transactions")
        .select(`
          *,
          medicines(id, name, unit_price)
        `)
        .order("created_at", { ascending: false })

      if (medicineId) {
        query = query.eq("medicine_id", medicineId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Cache invalidation helpers
export function useCacheInvalidation() {
  const queryClient = useQueryClient()

  return {
    invalidateSales: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SALES] }),
    invalidatePayments: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PAYMENTS] }),
    invalidateProducts: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS] }),
    invalidateInventory: () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.INVENTORY] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  }
}

// Mutation hooks with cache updates
export function useCreateSaleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (saleData: any) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("sales").insert(saleData).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SALES] })
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PAYMENTS] })
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.INVENTORY] })
    },
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase.from("medicines").update(data).eq("id", id).select().single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PRODUCTS] })
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.INVENTORY] })
    },
  })
}
