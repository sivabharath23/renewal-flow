'use server';

import { cookies } from 'next/headers';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function getTenants() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return [];
    }
    
    return await db.user.findMany({
      where: {
        role: 'CLIENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to get tenants:', error);
    return [];
  }
}

export async function impersonateTenant(tenantId: string | null) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }

    const cookieStore = await cookies();
    if (tenantId) {
      cookieStore.set('admin_impersonate_user_id', tenantId, {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: true,
      });
    } else {
      cookieStore.delete('admin_impersonate_user_id');
    }
    
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to impersonate tenant:', error);
    return { error: 'Impersonation failed' };
  }
}

export async function getActiveImpersonation() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('admin_impersonate_user_id')?.value || null;
  } catch (error) {
    console.error('Failed to get active impersonation:', error);
    return null;
  }
}
