import { NextResponse } from "next/server";
import { loginAsDemo } from "@/lib/auth/auth-service";
import { SESSION_COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  try {
    const result = await loginAsDemo();

    if (!result.success || !result.token) {
      return NextResponse.json(
        { success: false, error: "Failed to initiate demo session." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl: "/app/dashboard",
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      result.token,
      getSessionCookieOptions()
    );

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

