import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from "@/lib/tracking/notifications";
import { db } from "@/lib/db";

/**
 * GET /api/notifications
 * Fetch notifications for the authenticated user
 * Query params: unreadOnly (boolean)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    const notifications = await getNotifications(user.id, unreadOnly);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 * Body: { notificationId?: string, markAll?: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await markAllNotificationsRead(user.id);
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await markNotificationRead(notificationId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Either notificationId or markAll must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[NOTIFICATIONS API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for the authenticated user
 */
export async function GET_UNREAD_COUNT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const count = await getUnreadCount(user.id);

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get unread count" },
      { status: 500 }
    );
  }
}
