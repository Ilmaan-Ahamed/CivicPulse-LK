import { NextRequest, NextResponse } from "next/server";
import { Language, Role } from "@prisma/client";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, firstName, lastName, clerkId } = body;

    const finalEmail = String(email || "").toLowerCase().trim();
    const fullName = String(name || "").trim();
    const resolvedFirstName = String(firstName || fullName.split(" ")[0] || "").trim();
    const resolvedLastName = String(lastName || fullName.split(" ").slice(1).join(" ") || "").trim();

    if (!finalEmail || (!resolvedFirstName && !resolvedLastName && !fullName)) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: finalEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const validRoles = Object.values(Role);
    const userRole = validRoles.includes(role as Role) ? (role as Role) : Role.CITIZEN;

    const user = await db.user.create({
      data: {
        clerkId: String(clerkId || `local_${Date.now()}`),
        email: finalEmail,
        firstName: resolvedFirstName || fullName,
        lastName: resolvedLastName || null,
        role: userRole,
        preferredLang: Language.EN,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        preferredLanguage: user.preferredLang,
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
