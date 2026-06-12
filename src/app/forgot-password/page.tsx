'use client';

import { useActionState, startTransition } from 'react';
import { sendOtpAction } from './actions';
import { Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(sendOtpAction, null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden w-full">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[120px] opacity-70 -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100 blur-[120px] opacity-70 -z-10" />

      <div className="w-full max-w-md">
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

        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800">Reset Password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your email address below, and we will send you a 6-digit One-Time Password (OTP) to reset your account credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {state?.error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 tracking-wide block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="siva@example.com"
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
                  <span>Sending OTP...</span>
                </>
              ) : (
                <span>Send OTP Code</span>
              )}
            </button>
          </form>

          {/* Go back to sign in */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-400">
            Remembered password?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
