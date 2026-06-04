'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Globe,
  Server,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Domains', path: '/domains', icon: Globe },
    { name: 'Servers', path: '/servers', icon: Server },
    { name: 'AMC Contracts', path: '/amc', icon: FileSpreadsheet },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setIsOpen(false);
    setIsLogoutConfirmOpen(false);
    const res = await logoutAction();
    if (res.success) {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="flex md:hidden items-center justify-between px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 fixed top-0 left-0 right-0 h-16 z-30 no-print w-full shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
              Renewal<span className="text-blue-600">Flow</span>
            </h1>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              Management Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-slate-100"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-30 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Navigation Sheet */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 md:z-25 w-64 h-screen glass-sidebar p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                  Renewal<span className="text-blue-600">Flow</span>
                </h1>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Management Portal
                </span>
              </div>
            </div>
            {/* Close button inside sidebar for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 md:hidden rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs border-l-3 border-blue-600 pl-2.5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Session profile and logout */}
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          {user && (
            <div className="px-3 flex flex-col">
              <span className="text-xs font-bold text-slate-800 truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 font-medium truncate">{user.email}</span>
            </div>
          )}
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-sm w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <LogOut className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-1.5">Sign Out</h3>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              Are you sure you want to sign out of your account? You will need to log back in to access the portal.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 hover:bg-rose-700 active:bg-rose-800 cursor-pointer transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
