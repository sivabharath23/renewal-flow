'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none no-print">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-emerald-50',
            error: 'bg-red-50 border-red-100 text-red-800 shadow-red-50',
            warning: 'bg-amber-50 border-amber-100 text-amber-800 shadow-amber-50',
            info: 'bg-blue-50 border-blue-100 text-blue-800 shadow-blue-50',
          };
          
          const Icon = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info,
          }[toast.type];

          const iconColors = {
            success: 'text-emerald-500',
            error: 'text-red-500',
            warning: 'text-amber-500',
            info: 'text-blue-500',
          };

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg pointer-events-auto transition-all duration-300 animate-slide-in ${typeStyles[toast.type]}`}
              role="alert"
            >
              <Icon className={`w-5 h-5 shrink-0 ${iconColors[toast.type]}`} />
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-100/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
