import { NextRequest, NextResponse } from "next/server";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

// In production, these should come from environment variables
const rpName = "Gatherflow Church Management";
const rpID = "localhost";
const origin = `http://${rpID}:3002`;

export async function POST(request: NextRequest) {
  try {
    const { action, email, ...data } = await request.json();

    switch (action) {
      case "generateRegistrationOptions":
        // Generate registration options for a user
        const options = await generateRegistrationOptions({
          rpName,
          rpID,
          userID: crypto.randomUUID(),
          userName: email,
          userDisplayName: email,
          attestationType: "none",
          excludeCredentials: [], // In production, get from database
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
            authenticatorAttachment: "platform",
          },
        });

        return NextResponse.json({ success: true, options });

      case "verifyRegistration":
        // Verify registration response
        const verification = await verifyRegistrationResponse({
          response: data.response,
          expectedChallenge: data.expectedChallenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
        });

        return NextResponse.json({
          success: verification.verified,
          registrationInfo: verification.registrationInfo,
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Passkey API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
