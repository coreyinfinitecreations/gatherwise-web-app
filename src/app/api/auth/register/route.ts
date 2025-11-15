import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { church, admin, skipPayment, stripeToken } = body;

    if (!church || !admin) {
      return NextResponse.json(
        { error: "Church and admin information required" },
        { status: 400 }
      );
    }

    if (
      !admin.email ||
      !admin.password ||
      !admin.firstName ||
      !admin.lastName
    ) {
      return NextResponse.json(
        {
          error:
            "Admin email, password, first name, and last name are required",
        },
        { status: 400 }
      );
    }

    if (
      !church.name ||
      !church.address ||
      !church.city ||
      !church.state ||
      !church.zipCode
    ) {
      return NextResponse.json(
        {
          error: "Church name, address, city, state, and ZIP code are required",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const campusName = church.campusName || "Main Campus";

    const newChurch = await prisma.church.create({
      data: {
        name: church.name,
        description: church.description,
        address: `${church.address}, ${church.city}, ${church.state} ${church.zipCode}`,
        phone: church.phone,
        email: church.email,
        website: church.website,
        trialEndsAt,
        subscriptionStatus: "trial",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        paymentMethod: skipPayment ? null : "pending",
        campuses: {
          create: {
            name: campusName,
            description: "Primary church location",
            address: `${church.address}, ${church.city}, ${church.state} ${church.zipCode}`,
            phone: church.phone,
            email: church.email,
            isActive: true,
          },
        },
      },
      include: {
        campuses: true,
      },
    }) as any;

    const mainCampus = newChurch.campuses[0];

    const passwordHash = await bcrypt.hash(admin.password, 12);

    const adminUser = await prisma.user.create({
      data: {
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        passwordHash,
        phone: admin.phone,
        role: "SUPER_ADMIN",
        organizationId: newChurch.id,
        organizationName: newChurch.name,
        campusId: mainCampus.id,
        isActive: true,
        emailVerified: new Date(),
        onboardingCompleted: false,
        churches: {
          create: {
            churchId: newChurch.id,
            campusId: mainCampus.id,
            role: "ADMIN",
          },
        },
      },
    });

    console.log("Registration successful:", {
      churchId: newChurch.id,
      churchName: newChurch.name,
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      trialEndsAt: newChurch.trialEndsAt,
      subscriptionStatus: newChurch.subscriptionStatus,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
      church: {
        id: newChurch.id,
        name: newChurch.name,
        trialEndsAt: newChurch.trialEndsAt,
        subscriptionStatus: newChurch.subscriptionStatus,
      },
      campus: {
        id: mainCampus.id,
        name: mainCampus.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create account",
      },
      { status: 500 }
    );
  }
}
