import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_ROLE_USERS, UserRole } from "@/lib/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check mock role users first for seamless demo experience
    const matchingMock = Object.values(MOCK_ROLE_USERS).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (matchingMock) {
      return NextResponse.json({
        success: true,
        user: matchingMock,
      });
    }

    // Attempt DB lookup if configured
    try {
      const user = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0],
            email: user.email,
            role: user.role as UserRole,
            trustScore: user.trustScore,
            dsDivisionCode: user.dsDivision || "DS-COL-01",
            dsDivisionName: user.district ? `${user.district} DS Office` : "Colombo DS Office",
            preferredLanguage: user.preferredLang.toLowerCase(),
            avatarUrl: user.avatarUrl,
          },
        });
      }
    } catch {
      // If db fails, continue to mock fallback
    }

    // Default mock user for custom email
    const namePart = cleanEmail.split("@")[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    return NextResponse.json({
      success: true,
      user: {
        id: `user-${Date.now()}`,
        name: formattedName || "Civic User",
        email: cleanEmail,
        role: "CITIZEN" as UserRole,
        trustScore: 75.0,
        dsDivisionCode: "DS-COL-01",
        dsDivisionName: "Colombo DS Office",
        preferredLanguage: "en",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

