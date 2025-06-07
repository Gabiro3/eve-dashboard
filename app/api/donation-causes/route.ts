import { type NextRequest, NextResponse } from "next/server"
import { DonationService } from "@/lib/services/donation-service"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const is_active = searchParams.get("is_active") ? searchParams.get("is_active") === "true" : undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const causes = await DonationService.getDonationCauses({ is_active, limit })
    return NextResponse.json({ data: causes })
  } catch (error) {
    console.error("Error fetching donation causes:", error)
    return NextResponse.json({ error: "Failed to fetch donation causes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const cause = await DonationService.createDonationCause({
      ...body,
      created_by: user.id,
    })

    return NextResponse.json({ data: cause }, { status: 201 })
  } catch (error) {
    console.error("Error creating donation cause:", error)
    return NextResponse.json({ error: "Failed to create donation cause" }, { status: 500 })
  }
}
