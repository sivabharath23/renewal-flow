'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, X, Crop, Move } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedBase64: string) => void;
  onCancel: () => void;
  initialAspectRatio?: '3:1' | '1:1';
}

export default function ImageCropper({
  imageUrl,
  onCrop,
  onCancel,
  initialAspectRatio = '3:1'
}: ImageCropperProps) {
  const [aspectRatio, setAspectRatio] = useState<'3:1' | '1:1'>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Viewport sizes
  const viewportWidth = aspectRatio === '3:1' ? 360 : 200;
  const viewportHeight = aspectRatio === '3:1' ? 120 : 200;

  // Reset zoom and position when aspect ratio changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y
    });
  };

  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Output dimensions (3:1 is 450x150, 1:1 is 300x300)
    const canvasWidth = aspectRatio === '3:1' ? 450 : 300;
    const canvasHeight = aspectRatio === '3:1' ? 150 : 300;

    // Calculate base fit size inside the crop viewport
    let fitWidth = 0;
    let fitHeight = 0;
    const imgRatio = naturalWidth / naturalHeight;
    const viewRatio = viewportWidth / viewportHeight;

    if (imgRatio > viewRatio) {
      // Image is wider than viewport
      fitWidth = viewportWidth;
      fitHeight = viewportWidth / imgRatio;
    } else {
      // Image is taller than viewport
      fitHeight = viewportHeight;
      fitWidth = viewportHeight * imgRatio;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Draw background (transparent)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply the exact transformation centered
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    
    // Scale viewport coordinates to output canvas coordinates
    const scaleMultiplier = canvasWidth / viewportWidth;
    ctx.scale(scaleMultiplier, scaleMultiplier);

    // Apply translate (pan)
    ctx.translate(position.x, position.y);

    // Apply zoom
    ctx.scale(zoom, zoom);

    // Draw image centered relative to current origin
    ctx.drawImage(img, -fitWidth / 2, -fitHeight / 2, fitWidth, fitHeight);

    // Get base64 representation
    try {
      const croppedBase64 = canvas.toDataURL('image/png');
      onCrop(croppedBase64);
    } catch (err) {
      console.error('Failed to crop image:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div 
        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onMouseLeave={handleMouseUp}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-sm text-slate-200 tracking-tight">Adjust Logo Placement</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Viewport Workspace */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none">
          {/* Instruction */}
          <span className="text-[10px] font-semibold text-slate-500 mb-4 flex items-center gap-1">
            <Move className="w-3 h-3 text-blue-500" /> Drag to pan. Use slider to zoom.
          </span>

          {/* Viewport Box */}
          <div
            style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
            className="relative border-2 border-blue-500/80 rounded-lg shadow-2xl shadow-blue-500/10 cursor-move bg-slate-900 overflow-hidden flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* The Image to Crop */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Logo source"
              draggable={false}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                maxWidth: 'none',
                maxHeight: 'none',
                // Keep image responsive for viewport calculations
                width: aspectRatio === '3:1' ? '100%' : 'auto',
                height: aspectRatio === '3:1' ? 'auto' : '100%',
              }}
            />
          </div>

          {/* Mask Shadow Overlays */}
          <div className="text-[10px] text-slate-500 font-medium mt-4">
            Crop Area: {aspectRatio === '3:1' ? '450 × 150 (3:1)' : '300 × 300 (1:1)'}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="p-5 border-t border-slate-800/80 space-y-4">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Aspect Ratio</span>
            <div className="inline-flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setAspectRatio('3:1')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  aspectRatio === '3:1'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Landscape (3:1)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  aspectRatio === '1:1'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Square (1:1)
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-500" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-500" />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer border border-slate-700/50 flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Crop & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
