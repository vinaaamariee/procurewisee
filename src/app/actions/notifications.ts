'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
export async function getNotificationsAction(role: string, userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: userId },
          { role: role },
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
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
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
export async function markAllNotificationsAsReadAction(role: string, userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: userId },
          { role: role },
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
