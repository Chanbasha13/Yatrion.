import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { trips } from "@/lib/db/schema";
import { runMigrations } from "@/lib/db/migrate";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  extractSessionTokenFromCookieHeader,
} from "@/lib/auth/session";
import { isValidStoredTrip, type StoredTripState } from "@/lib/trip-storage";

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
      .from(trips)
      .where(eq(trips.userId, userId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ success: true, trip: null, exists: false });
    }

    const row = rows[0];
    const preferences = JSON.parse(row.preferencesJson);
    const originalItinerary = JSON.parse(row.itineraryJson);
    const routePlan = row.routeJson ? JSON.parse(row.routeJson) : null;
    const budgetPlan = row.budgetJson ? JSON.parse(row.budgetJson) : null;
    const groupState = row.groupStateJson ? JSON.parse(row.groupStateJson) : null;
    const dayNotes = row.dayNotesJson ? JSON.parse(row.dayNotesJson) : {};
    const stopNotes = row.stopNotesJson ? JSON.parse(row.stopNotesJson) : {};
    const completedStopKeys = row.completedStopsJson ? JSON.parse(row.completedStopsJson) : [];
    const savedGemIds = row.savedGemIdsJson ? JSON.parse(row.savedGemIdsJson) : [];

    const tripState: StoredTripState = {
      version: 1,
      savedAt: row.updatedAt,
      preferences,
      originalItinerary,
      editedDays: originalItinerary.days || [],
      removedStops: {},
      dayNotes,
      stopNotes,
      completedStopKeys,
      optimizedRoute: routePlan,
      budgetPlan,
      groupState,
      savedGemIds,
      serverVersion: row.version,
    };

    return NextResponse.json({
      success: true,
      trip: tripState,
      exists: true,
      serverVersion: row.version,
      updatedAt: row.updatedAt,
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
    const trip = body.trip as StoredTripState;
    const clientVersion = typeof body.clientVersion === "number" ? body.clientVersion : trip?.serverVersion;

    if (!trip || !isValidStoredTrip(trip)) {
      return NextResponse.json(
        { success: false, error: "Invalid trip payload schema." },
        { status: 400 }
      );
    }

    await runMigrations();
    const db = getDb();
    const now = new Date().toISOString();

    const existing = await db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .limit(1);

    let newVersion = 1;

    if (existing.length > 0) {
      const current = existing[0];
      // Optimistic concurrency check: if client sent an outdated version and it's not a forced sync
      if (
        clientVersion !== undefined &&
        clientVersion < current.version &&
        !body.force
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Conflict: A newer version of this trip exists on the server.",
            currentServerVersion: current.version,
            clientVersion,
            conflict: true,
          },
          { status: 409 }
        );
      }

      newVersion = current.version + 1;

      await db
        .update(trips)
        .set({
          title: trip.originalItinerary.title || "Karnataka Journey",
          destinationIdsJson: JSON.stringify(trip.preferences.selectedDestinationIds || []),
          preferencesJson: JSON.stringify(trip.preferences),
          itineraryJson: JSON.stringify({
            ...trip.originalItinerary,
            days: trip.editedDays || trip.originalItinerary.days,
          }),
          routeJson: trip.optimizedRoute ? JSON.stringify(trip.optimizedRoute) : null,
          budgetJson: trip.budgetPlan ? JSON.stringify(trip.budgetPlan) : null,
          groupStateJson: trip.groupState ? JSON.stringify(trip.groupState) : null,
          dayNotesJson: JSON.stringify(trip.dayNotes || {}),
          stopNotesJson: JSON.stringify(trip.stopNotes || {}),
          completedStopsJson: JSON.stringify(trip.completedStopKeys || []),
          savedGemIdsJson: JSON.stringify(trip.savedGemIds || []),
          version: newVersion,
          updatedAt: now,
        })
        .where(eq(trips.userId, userId));
    } else {
      const id = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(trips).values({
        id,
        userId,
        title: trip.originalItinerary.title || "Karnataka Journey",
        destinationIdsJson: JSON.stringify(trip.preferences.selectedDestinationIds || []),
        preferencesJson: JSON.stringify(trip.preferences),
        itineraryJson: JSON.stringify({
          ...trip.originalItinerary,
          days: trip.editedDays || trip.originalItinerary.days,
        }),
        routeJson: trip.optimizedRoute ? JSON.stringify(trip.optimizedRoute) : null,
        budgetJson: trip.budgetPlan ? JSON.stringify(trip.budgetPlan) : null,
        groupStateJson: trip.groupState ? JSON.stringify(trip.groupState) : null,
        dayNotesJson: JSON.stringify(trip.dayNotes || {}),
        stopNotesJson: JSON.stringify(trip.stopNotes || {}),
        completedStopsJson: JSON.stringify(trip.completedStopKeys || []),
        savedGemIdsJson: JSON.stringify(trip.savedGemIds || []),
        version: newVersion,
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      version: newVersion,
      updatedAt: now,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request?: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    await runMigrations();
    const db = getDb();
    await db.delete(trips).where(eq(trips.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Active trip successfully removed from server database.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
