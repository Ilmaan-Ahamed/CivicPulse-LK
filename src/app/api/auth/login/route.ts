import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
