'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction } from '@/app/login/actions';
import TenantSwitcher from './TenantSwitcher';
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
  X,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  // Collapse state for desktop viewports
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Initialize collapse state from localStorage after mount to prevent SSR mismatch
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed') === 'true';
    setIsCollapsed(saved);
    setMounted(true);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar_collapsed', String(nextState));
  };

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
    { name: 'Notifications', path: '/notifications', icon: Bell },
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

  const bottomNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Payments', path: '/payments', icon: CreditCard },
  ];

  const isMoreActive = !bottomNavItems.some(item => pathname.startsWith(item.path)) && pathname !== '/login';

  // Prevent flash of expanded sidebar on mount if previously collapsed
  const currentCollapseState = mounted ? isCollapsed : false;

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
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link
                href="/notifications"
                className={`p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-slate-100 ${
                  pathname.startsWith('/notifications') ? 'text-blue-600 bg-blue-50/50' : ''
                }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-red-100/30"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {user && (
        <nav className="flex md:hidden items-center justify-around fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-white/95 backdrop-blur-md border-t border-slate-200/85 z-30 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] no-print">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors select-none ${
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`w-5.5 h-5.5 transition-transform duration-200 ${isActive ? 'scale-110 text-blue-600' : 'text-slate-400'}`} />
                </div>
                <span className={`text-[10px] mt-1 font-semibold tracking-tight transition-all duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          {/* More Tab */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors cursor-pointer select-none ${
              isMoreActive || isOpen ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative flex items-center justify-center">
              {isOpen ? (
                <X className="w-5.5 h-5.5 transition-transform duration-200 scale-110 text-blue-600" />
              ) : (
                <Menu className={`w-5.5 h-5.5 transition-transform duration-200 ${isMoreActive ? 'scale-110 text-blue-600' : 'text-slate-400'}`} />
              )}
            </div>
            <span className={`text-[10px] mt-1 font-semibold tracking-tight transition-all duration-200 ${isMoreActive || isOpen ? 'text-blue-600' : 'text-slate-400'}`}>
              More
            </span>
          </button>
        </nav>
      )}

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-30 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Navigation Sheet */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 md:z-25 h-[100dvh] overflow-y-auto glass-sidebar p-4 flex flex-col justify-between transition-all duration-300 ease-in-out no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${currentCollapseState ? 'w-64 md:w-20' : 'w-64'}`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className={`flex items-center justify-between px-3 py-2 ${currentCollapseState ? 'md:flex-col md:gap-4 md:px-0' : ''}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200 shrink-0">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              {!currentCollapseState && (
                <div className="animate-fade-in duration-200">
                  <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                    Renewal<span className="text-blue-600">Flow</span>
                  </h1>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Management Portal
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 md:hidden rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-100 shadow-xs"
              aria-label={currentCollapseState ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {currentCollapseState ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Tenant Switcher */}
          {user && user.role === 'ADMIN' && (
            <div className="md:hidden px-3.5 mb-2 shrink-0">
              <TenantSwitcher />
            </div>
          )}

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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                    currentCollapseState ? 'md:justify-center md:px-0 md:w-12 md:mx-auto' : ''
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs border-l-3 border-blue-600 pl-2.5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  title={currentCollapseState ? item.name : undefined}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {!currentCollapseState && <span className="animate-fade-in duration-150">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Session profile and logout */}
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          {user && !currentCollapseState && (
            <div className="px-3 flex flex-col animate-fade-in duration-150">
              <span className="text-xs font-bold text-slate-800 truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 font-medium truncate">{user.email}</span>
            </div>
          )}
          {user && currentCollapseState && (
            <div 
              className="hidden md:flex justify-center text-[10px] font-black w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 items-center mx-auto cursor-default select-none uppercase" 
              title={`${user.name} (${user.email})`}
            >
              {user.name.charAt(0)}
            </div>
          )}
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer ${
              currentCollapseState ? 'md:justify-center md:px-0 md:w-12 md:mx-auto' : ''
            }`}
            title={currentCollapseState ? 'Sign Out' : undefined}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!currentCollapseState && <span className="animate-fade-in duration-150">Sign Out</span>}
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
