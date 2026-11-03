import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { savedPlaces } from "@/lib/db/schema";
import { runMigrations } from "@/lib/db/migrate";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  extractSessionTokenFromCookieHeader,
} from "@/lib/auth/session";

async function getAuthenticatedUserId(req?: Request): Promise<string | null> {
  const cookieHeader = req?.headers.get("cookie");
  let token = extractSessionTokenFromCookieHeader(cookieHeader);
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
    } catch {
      // Outside Next.js request context
    }
  }
  if (!token) return null;

  const session = await verifySessionToken(token);
  return session ? session.userId : null;
}

export async function GET(req?: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    await runMigrations();
    const db = getDb();
    const rows = await db
      .select()
      .from(savedPlaces)
      .where(eq(savedPlaces.userId, userId));

    return NextResponse.json({
      success: true,
      savedPlaces: rows.map((r) => r.placeId),
      count: rows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const placeId = (body.placeId || "").trim();
    const action = body.action || "toggle"; // "add" | "remove" | "toggle"
    const notes = body.notes || null;

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: "placeId is required." },
        { status: 400 }
      );
    }

    await runMigrations();
    const db = getDb();

    const existing = await db
      .select()
      .from(savedPlaces)
      .where(and(eq(savedPlaces.userId, userId), eq(savedPlaces.placeId, placeId)))
      .limit(1);

    let actionTaken: "added" | "removed";

    if (existing.length > 0) {
      if (action === "add") {
        actionTaken = "added";
      } else {
        // "remove" or "toggle"
        await db
          .delete(savedPlaces)
          .where(and(eq(savedPlaces.userId, userId), eq(savedPlaces.placeId, placeId)));
        actionTaken = "removed";
      }
    } else {
      if (action === "remove") {
        actionTaken = "removed";
      } else {
        const id = `save-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(savedPlaces).values({
          id,
          userId,
          placeId,
          notes,
          createdAt: new Date().toISOString(),
        });
        actionTaken = "added";
      }
    }

    const allUserPlaces = await db
      .select()
      .from(savedPlaces)
      .where(eq(savedPlaces.userId, userId));

    return NextResponse.json({
      success: true,
      actionTaken,
      savedPlaces: allUserPlaces.map((r) => r.placeId),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let placeId = searchParams.get("placeId");

    if (!placeId) {
      try {
        const body = await request.json();
        placeId = body.placeId;
      } catch {
        // Param wasn't in body either
      }
    }

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: "placeId is required to delete bookmark." },
        { status: 400 }
      );
    }

    await runMigrations();
    const db = getDb();
    await db
      .delete(savedPlaces)
      .where(and(eq(savedPlaces.userId, userId), eq(savedPlaces.placeId, placeId)));

    const allUserPlaces = await db
      .select()
      .from(savedPlaces)
      .where(eq(savedPlaces.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Place removed from bookmarks.",
      savedPlaces: allUserPlaces.map((r) => r.placeId),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
