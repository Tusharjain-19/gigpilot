import React from 'react';

export default function GigPilotLogo({ size = 'md', className = '' }) {
  const isSmall = size === 'sm';
  
  return (
    <div className={`flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Aesthetic Geometric Directional Mark */}
      <div className={`flex items-center justify-center rounded-lg bg-[#059669] text-white shadow-sm shrink-0 transition-transform duration-150 ${
        isSmall ? 'w-7 h-7' : 'w-8 h-8 sm:w-8.5 sm:h-8.5'
      }`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isSmall ? 'w-4 h-4' : 'w-4.5 h-4.5'}
        >
          <polygon points="12 3 19 20 12 16 5 20 12 3" fill="currentColor" fillOpacity="0.2" />
        </svg>
      </div>

      {/* Clean Human Typography */}
      <div className="flex items-center gap-1.5">
        <span className={`font-heading font-extrabold tracking-tight text-[var(--text-primary)] ${
          isSmall ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
        }`}>
          Gig<span className="text-[#059669] dark:text-[#34D399]">Pilot</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399] inline-block"></span>
      </div>
    </div>
  );
}
