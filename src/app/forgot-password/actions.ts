'use server';

import db from '@/lib/db';
import { hashPassword } from '@/lib/auth-helpers';
import { sendEmail } from '@/lib/email';
import { redirect } from 'next/navigation';

export async function sendOtpAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Please enter your email address.' };
  }

  let redirectToVerify = false;

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Save to DB
      await db.user.update({
        where: { email },
        data: {
          otpCode,
          otpExpiry,
        },
      });

      // Send Email
      await sendEmail({
        to: email,
        subject: 'Your Password Reset OTP - RenewalFlow',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="margin-bottom: 20px; text-align: center;">
              <span style="font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px;">RenewalFlow</span>
            </div>
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Reset Your Password</h2>
            <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 16px;">Hello,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 24px;">You requested to reset your password. Use the following 6-digit One-Time Password (OTP) to complete verification. This OTP is valid for 10 minutes.</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e293b; font-family: monospace;">${otpCode}</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    redirectToVerify = true;
  } catch (error) {
    console.error('Send OTP error:', error);
    return { error: 'Failed to send OTP. Please try again later.' };
  }

  if (redirectToVerify) {
    redirect(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
  }
}

export async function verifyOtpAndResetPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const otpCode = formData.get('otpCode') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !otpCode || !password || !confirmPassword) {
    return { error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  let redirectToLogin = false;

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.otpCode || !user.otpExpiry) {
      return { error: 'Invalid reset request or OTP expired.' };
    }

    // Check expiration
    if (new Date() > user.otpExpiry) {
      return { error: 'OTP has expired. Please request a new code.' };
    }

    // Check code match
    if (user.otpCode !== otpCode) {
      return { error: 'Invalid OTP code. Please verify the code.' };
    }

    // Code matches & valid! Update password
    const hashedPassword = hashPassword(password);
    await db.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpiry: null,
      },
    });

    redirectToLogin = true;
  } catch (error) {
    console.error('Verify OTP and Reset error:', error);
    return { error: 'Failed to reset password. Please try again.' };
  }

  if (redirectToLogin) {
    redirect('/login?reset=success');
  }
}
