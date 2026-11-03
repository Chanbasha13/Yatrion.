import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/auth-service";
import { SESSION_COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    if (!result.success || !result.token) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Signup failed",
          fieldErrors: result.fieldErrors,
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl: result.redirectUrl || "/app/dashboard",
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

