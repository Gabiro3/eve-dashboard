import type { NextRequest } from "next/server"
import { supabaseAdmin } from "./supabase"
import type { UserRole } from "@/types/database"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
  doctor_id?: string | null
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const userJson = request.cookies.get("eve-care-auth-user")?.value
    if (!userJson) return null

    const user = JSON.parse(userJson)
    if (!user?.id) return null

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) return null

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name,
      doctor_id: profile.doctor_id,
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}



export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function requireAuth(requiredRoles: UserRole[] = []) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request)

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (requiredRoles.length > 0 && !hasPermission(user.role, requiredRoles)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return user
  }
}
