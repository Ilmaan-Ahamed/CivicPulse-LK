import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";

async function getUsers(req: Request) {
  const { userId } = await requireRole(["ADMIN"] as any);

  const users = await db.user.findMany({
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      trustScore: true,
      preferredLang: true,
      district: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: users.map((user) => ({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User",
      email: user.email,
      role: user.role,
      status: "ACTIVE",
      trustScore: user.trustScore,
    })),
  });
}

export const GET = getUsers;
