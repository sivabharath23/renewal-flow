'use client';

import { useActionState, startTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyOtpAndResetPasswordAction } from '../actions';
import { KeyRound, ShieldCheck, Hash } from 'lucide-react';
import Link from 'next/link';

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [state, formAction, isPending] = useActionState(
    verifyOtpAndResetPasswordAction,
    null
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  if (!email) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50 text-center">
        <h2 className="text-xl font-bold text-slate-800">Invalid Request</h2>
        <p className="text-xs text-slate-400 mt-2">
          No email address was provided for verification. Please start password recovery from the beginning.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Verify OTP</h2>
        <p className="text-xs text-slate-400 mt-1">
          We sent a 6-digit verification code to <strong className="text-slate-700">{email}</strong>. Enter the OTP code and set your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {state?.error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
            {state.error}
          </div>
        )}

        {/* Hidden Email */}
        <input type="hidden" name="email" value={email} />

        {/* OTP Input */}
        <div className="space-y-1">
          <label htmlFor="otpCode" className="text-xs font-semibold text-slate-700 tracking-wide block">
            One-Time Password (OTP)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="otpCode"
              name="otpCode"
              required
              maxLength={6}
              placeholder="123456"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono font-bold tracking-widest text-center"
            />
          </div>
        </div>

        {/* New Password Input */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide block">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>

        {/* Confirm New Password Input */}
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 tracking-wide block">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 disabled:pointer-events-none hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying & Resetting...</span>
            </>
          ) : (
            <span>Reset Password</span>
          )}
        </button>
      </form>

      {/* Resend Link Info */}
      <div className="mt-6 text-center text-xs font-semibold text-slate-400">
        Did not receive code?{' '}
        <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 transition-colors">
          Resend OTP
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden w-full">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[120px] opacity-70 -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100 blur-[120px] opacity-70 -z-10" />

      <div className="w-full max-w-md my-8">
        {/* Logo/Brand Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200 mb-3 hover:scale-105 transition-transform">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Renewal<span className="text-blue-600">Flow</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Client & Contract Renewals Manager
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-2xl border border-slate-100 p-24 text-center shadow-xl shadow-slate-100/50">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs font-semibold text-slate-400">Loading form...</span>
          </div>
        }>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </main>
  );
}
