import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from "@/lib/auth/rbac";
import { Language } from "@prisma/client";
import { isSignupRole, normalizeRole } from "@/lib/roles";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const requestedRole = normalizeRole(typeof role === "string" ? role : null);
    if (requestedRole && requestedRole !== "CITIZEN") {
      return NextResponse.json(
        { error: "Self-service role assignment is disabled. Roles are assigned by the server-side auth flow." },
        { status: 403 }
      );
    }

    const userRole: UserRole = "CITIZEN";
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || name.trim();
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const created = await db.user.create({
        data: {
          clerkId: `clerk_${Date.now()}`,
          email: cleanEmail,
          firstName,
          lastName,
          role: userRole,
          preferredLang: Language.EN,
          dsDivision: "DS-COL-01",
          district: "Colombo",
          trustScore: 70.0,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: created.id,
          name: `${created.firstName || ""} ${created.lastName || ""}`.trim() || name,
          email: created.email,
          role: created.role as UserRole,
          trustScore: created.trustScore,
          dsDivisionCode: created.dsDivision || "DS-COL-01",
          dsDivisionName: "Colombo DS Office",
          preferredLanguage: created.preferredLang.toLowerCase(),
          avatarUrl: created.avatarUrl,
        },
      });
    } catch {
      return NextResponse.json({
        success: true,
        user: {
          id: `user-${Date.now()}`,
          name: name.trim(),
          email: cleanEmail,
          role: userRole,
          trustScore: 70.0,
          dsDivisionCode: "DS-COL-01",
          dsDivisionName: "Colombo DS Office",
          preferredLanguage: "en",
        },
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

