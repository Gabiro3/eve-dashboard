import { type NextRequest, NextResponse } from "next/server";
import { AnnouncementService } from "@/lib/services/announcement-service";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get("is_active")
      ? searchParams.get("is_active") === "true"
      : undefined;
    const target_audience = searchParams.get("target_audience") || undefined;
    const limit = searchParams.get("limit")
      ? Number.parseInt(searchParams.get("limit")!)
      : undefined;

    const announcements = await AnnouncementService.getAnnouncements({
      is_active,
      target_audience,
      limit,
    });

    return NextResponse.json({ data: announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const announcement = await AnnouncementService.createAnnouncement({
      ...body,
      created_by: user.id,
    });

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
