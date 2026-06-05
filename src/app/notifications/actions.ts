'use server';

import db from '@/lib/db';
import { getUserFilter } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function getReminders() {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    return await db.reminder.findMany({
      where: filter,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch reminders:', error);
    return [];
  }
}

export async function deleteReminderAction(id: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    await db.reminder.delete({
      where: {
        id,
        ...filter,
      },
    });

    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete reminder:', error);
    return { error: 'Failed to delete notification record.' };
  }
}
