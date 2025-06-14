import { type NextRequest, NextResponse } from "next/server";
import { ArticleService } from "@/lib/services/article-service";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const author_id = searchParams.get("author_id") || undefined;
    const category_id = searchParams.get("category_id") || undefined;
    const limit = searchParams.get("limit")
      ? Number.parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? Number.parseInt(searchParams.get("offset")!)
      : undefined;

    const filters = {
      status,
      author_id:
        user.role === "writer"
          ? user.doctor_id ?? undefined
          : author_id ?? undefined,
      category_id,
      limit,
      offset,
    };

    const articles = await ArticleService.getArticles(filters);

    return NextResponse.json({ data: articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || !["admin", "writer"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // For writers, use their doctor_id as author_id
    const authorId = user.role === "writer" ? user.doctor_id! : body.author_id;

    const article = await ArticleService.createArticle(body, authorId);
    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
