import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, dsDivisionId } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Validate role
    const validRoles = [
      "CITIZEN",
      "COMMUNITY_VERIFIER",
      "VOLUNTEER",
      "NGO",
      "GOVT_AGENCY",
      "DS_OFFICER",
      "ADMIN",
    ];
    const userRole = validRoles.includes(role) ? role : "CITIZEN";

    // Find a default DS division if none provided
    let divisionId = dsDivisionId;
    if (!divisionId) {
      const defaultDivision = await db.dsDivision.findFirst();
      divisionId = defaultDivision?.id;
    }

    // Create user (demo-grade: storing password as plain text)
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: password,
        role: userRole,
        dsDivisionId: divisionId || undefined,
        preferredLanguage: "en",
      },
      include: {
        dsDivision: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        organization: user.organization,
        dsDivisionCode: user.dsDivision?.code || "",
        dsDivisionName: user.dsDivision?.nameEn || "",
        preferredLanguage: user.preferredLanguage,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
