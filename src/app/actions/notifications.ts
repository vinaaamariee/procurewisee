'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/auth/get-user-profile';

/**
 * Creates a notification in the database.
 * Accessible from other server actions.
 */
export async function createNotificationHelper(data: {
  title: string;
  description: string;
  icon: string;
  role?: string | null;
  userId?: string | null;
}) {
  try {
    await getAuthenticatedUser();
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
        role: data.role || null,
        userId: data.userId || null,
        isRead: false,
      },
    });
    return { success: true, notification };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message || 'Failed to create notification' };
  }
}

/**
 * Retrieves read & unread notifications for a specific user and their role.
 */
export async function getNotificationsAction() {
  try {
    const { profile } = await getAuthenticatedUser();
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: profile.id },
          { role: profile.role },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
    return { success: true, notifications };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message || 'Failed to fetch notifications' };
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsReadAction(id: string) {
  try {
    const { profile } = await getAuthenticatedUser();
    const notification = await prisma.notification.updateMany({
      where: {
        id,
        OR: [{ userId: profile.id }, { role: profile.role }],
      },
      data: { isRead: true },
    });
    if (notification.count !== 1) {
      return { success: false, error: 'Notification not found.' };
    }
    revalidatePath('/', 'layout');
    return { success: true, notification };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message || 'Failed to mark as read' };
  }
}

/**
 * Marks all active notifications for a user/role as read.
 */
export async function markAllNotificationsAsReadAction() {
  try {
    const { profile } = await getAuthenticatedUser();
    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: profile.id },
          { role: profile.role },
        ],
        isRead: false,
      },
      data: { isRead: true },
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message || 'Failed to mark all as read' };
  }
}
