'use server';

import { cookies } from 'next/headers';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const agencyType = formData.get('agencyType') as string;

  if (!name || !email || !password || !confirmPassword || !agencyType) {
    return { error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  let redirectToDashboard = false;

  try {
    // Check if user exists
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: 'An account with this email already exists.' };
    }

    const hashedPassword = hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        agencyType,
      },
    });

    // Set auth cookie
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
    console.error('Registration error:', error);
    return { error: 'Failed to create account. Please try again.' };
  }

  if (redirectToDashboard) {
    redirect('/dashboard');
  }
}
