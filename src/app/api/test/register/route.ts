import { NextResponse } from "next/server";
import { UserManager } from "@/lib/auth/user-manager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, organizationName } = body;

    // Validate required fields
    if (!email || !password || !organizationName) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, organizationName" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Create the admin user
    const newUser = await UserManager.createUser({
      email,
      password,
      name: body.name || organizationName + " Admin",
      role: "admin",
      organizationName,
    });

    console.log("✅ User created successfully:", {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    // Create a session token (simple JWT-like structure for demo)
    const sessionData = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: new Date().toISOString(),
    };

    // Encode session data (in production, use proper JWT signing)
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString(
      "base64"
    );

    // Return success with user and session info
    const response = NextResponse.json(
      {
        success: true,
        adminId: newUser.id,
        organizationId: organizationName, // For now, use org name as ID
        sessionToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    // Set authentication cookie
    response.cookies.set("isAuthenticated", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      httpOnly: false, // Allow client-side access for localStorage sync
    });

    // Set session token cookie
    response.cookies.set("session-token", sessionToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle specific errors
    if (error.message === "User already exists") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
