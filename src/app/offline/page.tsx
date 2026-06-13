'use client';

import { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Try to reload the page to check if connection is active
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 1200); // 1.2s spinner effect to feel premium
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden w-full select-none">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[120px] opacity-70 -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100 blur-[120px] opacity-70 -z-10" />

      <div className="w-full max-w-md text-center">
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shadow-sm mb-2">
            <WifiOff className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-800">
            Renewal<span className="text-blue-600">Flow</span>
          </h1>
        </div>

        {/* Offline Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50 flex flex-col items-center">
          {/* Custom Stylized Inline SVG representation of disconnected cloud / signal waves */}
          <div className="relative mb-6">
            <svg 
              className="w-24 h-24 text-slate-300 stroke-[1.8]" 
              viewBox="0 0 100 100" 
              fill="none" 
              stroke="currentColor"
            >
              {/* Cloud outline */}
              <path 
                d="M28 66a13 13 0 010-26 21 21 0 0140-5 16 16 0 0113 16 13 13 0 01-13 15H28z" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              {/* Concentric Signal Waves in background */}
              <path d="M42 42a12 12 0 0116 0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
              <path d="M36 36a20 20 0 0128 0" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              
              {/* Custom Warning lightning bolt or slash crossing */}
              <line 
                x1="20" 
                y1="20" 
                x2="80" 
                y2="80" 
                className="text-red-500 stroke-[3.5]" 
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="text-lg font-extrabold text-slate-800">No Internet Connection</h2>
          <p className="text-xs text-slate-400 mt-2.5 max-w-xs leading-relaxed">
            It looks like you are currently offline. Please check your network cables, Wi-Fi configuration, or cellular data settings and try again.
          </p>

          <div className="w-full mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg disabled:opacity-75 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking Connection...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Reconnecting</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Small footer */}
        <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-8">
          Offline Mode — Cached by Service Worker
        </p>
      </div>
    </main>
  );
}
