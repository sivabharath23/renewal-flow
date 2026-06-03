'use server';

import { cookies } from 'next/headers';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  let redirectToDashboard = false;

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return { error: 'Invalid email or password.' };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    redirectToDashboard = true;
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  if (redirectToDashboard) {
    redirect('/dashboard');
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
  return { success: true };
}
