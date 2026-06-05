import { cookies } from 'next/headers';
import crypto from 'crypto';
import db from './db';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_session')?.value;
    if (!userId) return null;
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
    
    return user;
  } catch (error) {
    console.error('Failed to get session user:', error);
    return null;
  }
}

export async function getUserFilter() {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.email === 'admin@renewalflow.com') {
    return {};
  }
  return { userId: user.id };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
}
