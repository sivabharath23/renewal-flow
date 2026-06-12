'use client';

import React from 'react';

interface InvoicePreloaderProps {
  text?: string;
  fullscreen?: boolean;
}

export default function InvoicePreloader({
  text = 'Loading details...',
  fullscreen = false,
}: InvoicePreloaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none">
      {/* Container for the SVG animations */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* SVG Wrapper */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Definitions for Gradients and Filters */}
          <defs>
            <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="indigo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>

          {/* Outer Dotted/Dashed Rotating Circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#blue-gradient)"
            strokeWidth="3.5"
            strokeDasharray="6 10"
            className="origin-center animate-spin-cw"
            style={{ transformOrigin: '80px 80px' }}
          />

          {/* Inner Dotted Rotating Circle (Slower, Reverse direction) */}
          <circle
            cx="80"
            cy="80"
            r="58"
            fill="none"
            stroke="url(#indigo-gradient)"
            strokeWidth="2.5"
            strokeDasharray="3 6"
            className="origin-center animate-spin-ccw opacity-50"
            style={{ transformOrigin: '80px 80px' }}
          />

          {/* Core Invoice Icon and Lines */}
          <g className="animate-invoice-float" style={{ transformOrigin: '80px 80px' }}>
            {/* Invoice Base Paper */}
            <path
              d="M 52 50 C 52 46.7 54.7 44 58 44 L 96 44 L 108 56 L 108 110 C 108 113.3 105.3 116 102 116 L 58 116 C 54.7 116 52 113.3 52 110 Z"
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth="2.5"
              className="drop-shadow-sm"
            />
            {/* Paper Fold Flap */}
            <path
              d="M 96 44 L 96 56 L 108 56 Z"
              fill="#dbeafe"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Line 1 (Invoice Title Line) */}
            <line
              x1="62"
              y1="66"
              x2="82"
              y2="66"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-draw-line-1"
            />

            {/* Line 2 */}
            <line
              x1="62"
              y1="76"
              x2="98"
              y2="76"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-draw-line-2"
            />

            {/* Line 3 */}
            <line
              x1="62"
              y1="86"
              x2="88"
              y2="86"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-draw-line-3"
            />

            {/* Line 4 (Bold Total/Amount) */}
            <line
              x1="62"
              y1="98"
              x2="98"
              y2="98"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-draw-line-4"
            />

            {/* Green Paid Stamp/Checkmark Badge */}
            <g className="animate-scale-badge" style={{ transformOrigin: '96px 106px' }}>
              <circle
                cx="96"
                cy="106"
                r="8"
                fill="#10b981"
              />
              <path
                d="M 92.5 106 L 95 108.5 L 99.5 103.5"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          </g>
        </svg>

        {/* Glow effect overlay */}
        <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />
      </div>

      {/* Caption Text */}
      {text && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <span className="text-sm font-bold text-slate-700 tracking-wide animate-pulse">
            {text}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest animate-pulse">
            Please wait
          </span>
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
        <div className="bg-white/90 p-6 rounded-3xl border border-slate-100/50 shadow-2xl glass-card">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
