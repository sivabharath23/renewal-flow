'use client';

import { useActionState, startTransition } from 'react';
import { loginAction } from '@/app/login/actions';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginFormContent() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const isResetSuccess = searchParams.get('reset') === 'success';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1">
          Sign in with your administrative credentials to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isResetSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600">
            Password reset successfully! Please sign in.
          </div>
        )}

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
              placeholder="test@renewalflow.com"
              defaultValue=""
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 disabled:pointer-events-none hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Redirect to Register */}
      <div className="mt-6 text-center text-xs font-semibold text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 transition-colors">
          Sign Up
        </Link>
      </div>

      {/* Quick reference guide */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-1.5">
          Default Credentials
        </span>
        <div className="inline-flex flex-col items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5">
          <span className="text-xs font-medium text-slate-500">
            Email: <strong className="text-slate-800">test@renewalflow.com</strong>
          </span>
          <span className="text-xs font-medium text-slate-500">
            Password: <strong className="text-slate-800">123456</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function LoginForm() {
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

        <Suspense fallback={
          <div className="bg-white rounded-2xl border border-slate-100 p-24 text-center shadow-xl shadow-slate-100/50">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs font-semibold text-slate-400">Loading form...</span>
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </div>
    </main>
  );
}
