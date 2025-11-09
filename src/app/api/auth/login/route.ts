import { NextRequest, NextResponse } from "next/server";
import { UserManager } from "@/lib/auth/user-manager";

export async function POST(request: NextRequest) {
  console.log("========================================");
  console.log("[Login API] POST request received!");
  console.log("[Login API] URL:", request.url);
  console.log("[Login API] Method:", request.method);
  console.log("========================================");

  try {
    const { email, password } = await request.json();

    console.log("[Login API] Received login request for email:", email);

    if (!email || !password) {
      console.log("[Login API] Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("[Login API] Calling UserManager.authenticateUser...");
    const user = await UserManager.authenticateUser(email, password);

    console.log(
      "[Login API] UserManager.authenticateUser returned:",
      user ? "User found" : "null"
    );

    if (!user) {
      console.log("[Login API] Authentication failed - returning 401");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("[Login API] Authentication successful for user:", user.email);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("[Login API] ERROR:", error);
    console.error("[Login API] Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
