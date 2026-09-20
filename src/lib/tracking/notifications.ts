import { db } from "@/lib/db";

/**
 * Create a notification for a user
 * @param userId - The user ID to notify
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type (REPORT_UPDATE, VERIFICATION, ASSIGNMENT, etc.)
 * @param entityId - Related entity ID (report, assignment, etc.)
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  entityId?: string
) {
  try {
    await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        entityId,
      },
    });

    console.info("[NOTIFICATION] Created", {
      userId,
      type,
      entityId,
    });
  } catch (error) {
    console.error("[NOTIFICATION] Error creating notification:", error);
  }
}

/**
 * Get notifications for a user
 * @param userId - The user ID
 * @param unreadOnly - Whether to fetch only unread notifications
 */
export async function getNotifications(userId: string, unreadOnly = false) {
  try {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return notifications;
  } catch (error) {
    console.error("[NOTIFICATION] Error fetching notifications:", error);
    return [];
  }
}

/**
 * Mark a notification as read
 * @param notificationId - The notification ID
 */
export async function markNotificationRead(notificationId: string) {
  try {
    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    console.info("[NOTIFICATION] Marked as read:", notificationId);
  } catch (error) {
    console.error("[NOTIFICATION] Error marking as read:", error);
  }
}

/**
 * Mark all notifications as read for a user
 * @param userId - The user ID
 */
export async function markAllNotificationsRead(userId: string) {
  try {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    console.info("[NOTIFICATION] Marked all as read for user:", userId);
  } catch (error) {
    console.error("[NOTIFICATION] Error marking all as read:", error);
  }
}

/**
 * Get unread notification count for a user
 * @param userId - The user ID
 */
export async function getUnreadCount(userId: string) {
  try {
    const count = await db.notification.count({
      where: { userId, isRead: false },
    });

    return count;
  } catch (error) {
    console.error("[NOTIFICATION] Error getting unread count:", error);
    return 0;
  }
}
