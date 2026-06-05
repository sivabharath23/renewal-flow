'use client';

import { useActionState, startTransition } from 'react';
import { registerAction } from './actions';
import { KeyRound, Mail, User, ShieldCheck, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  const agencyTypes = [
    'Freelance Developers',
    'Web Development Agencies',
    'Digital Marketing Agencies',
    'Hosting Resellers',
    'IT Service Providers',
    'SaaS Founders',
    'Startup Teams',
    'Website Maintenance Companies',
    'Small & Medium Businesses'
  ];

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

        {/* Registration Form Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign up to start managing your billing, invoices, and contracts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {state?.error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
                {state.error}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-semibold text-slate-700 tracking-wide block">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Sivabharath"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
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

            {/* Agency Type Dropdown */}
            <div className="space-y-1">
              <label htmlFor="agencyType" className="text-xs font-semibold text-slate-700 tracking-wide block">
                Organization / Account Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  id="agencyType"
                  name="agencyType"
                  required
                  defaultValue=""
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                >
                  <option value="" disabled>Select your business type...</option>
                  {agencyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide block">
                Password
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

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 tracking-wide block">
                Confirm Password
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          {/* Redirect to Login */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
