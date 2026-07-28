import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const onboardingSchema = z.object({
  role: z.enum(["CITIZEN", "VERIFIER"]),
  district: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid role selection", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { role, district } = parsed.data;

    // Update role in database
    await prisma.user.update({
      where: { clerkId: userId },
      data: { role, district: district ?? null },
    });

    // Mark onboarding complete in Clerk public metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { onboardingComplete: true, role },
    });

    return NextResponse.json({ success: true, role });
  } catch (error: unknown) {
    console.error("POST /api/onboarding error:", error);
    const message = error instanceof Error ? error.message : "Onboarding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
