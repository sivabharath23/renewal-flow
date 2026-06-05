'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl border border-slate-100 max-w-sm w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border ${
          isDanger ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          <AlertTriangle className={`w-6 h-6 ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 text-center mb-1.5">{title}</h3>
        <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isDanger 
                ? 'bg-rose-600 shadow-rose-200 hover:bg-rose-700 active:bg-rose-800' 
                : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700 active:bg-blue-800'
            } disabled:opacity-50`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
