import React, { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

/**
 * ResizableSplitPane component allowing doctors to drag a vertical splitter handle
 * to dynamically resize adjacent panels (Width-only adjustment).
 */
export default function ResizableSplitPane({
  leftContent,
  rightContent,
  initialLeftWidth = 33, // Initial left panel percentage
  minLeftWidth = 15,     // Minimum left panel percentage
  maxLeftWidth = 85,     // Maximum left panel percentage
  className = ''
}) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const containerRef = useRef(null);

  // Monitor window resize for responsive mode
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDragging = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      if (clientX === null) return;

      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      let newPercentage = (relativeX / rect.width) * 100;

      if (newPercentage < minLeftWidth) newPercentage = minLeftWidth;
      if (newPercentage > maxLeftWidth) newPercentage = maxLeftWidth;

      setLeftWidth(newPercentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col lg:flex-row w-full h-full relative select-none items-stretch gap-2 lg:gap-0 ${
        isDragging ? 'cursor-col-resize' : ''
      } ${className}`}
    >
      {/* Left Panel */}
      <div
        className="w-full lg:w-auto shrink-0 transition-all duration-75 min-w-0"
        style={{
          width: isDesktop ? `${leftWidth}%` : '100%'
        }}
      >
        {leftContent}
      </div>

      {/* Resizer Handle / Extender Bar (Desktop only) */}
      <div
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        className="hidden lg:flex items-center justify-center w-4 cursor-col-resize group z-20 shrink-0 relative hover:w-5 transition-all select-none px-1"
        title="Click and drag left/right to resize panels"
      >
        {/* Central Vertical Guide Line */}
        <div
          className={`w-1 h-full rounded-full transition-colors ${
            isDragging ? 'bg-[#062E6F]' : 'bg-slate-200 group-hover:bg-blue-400'
          }`}
        />

        {/* Floating Grip Handle Pill */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-9 rounded-md bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-400 group-hover:text-[#062E6F] group-hover:border-blue-400 transition-all ${
            isDragging ? 'border-[#062E6F] text-[#062E6F] shadow-lg scale-110' : ''
          }`}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="w-full lg:w-auto flex-1 min-w-0 transition-all duration-75"
        style={{
          width: isDesktop ? `calc(${100 - leftWidth}% - 16px)` : '100%'
        }}
      >
        {rightContent}
      </div>
    </div>
  );
}
