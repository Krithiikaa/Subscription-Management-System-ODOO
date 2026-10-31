import React from 'react';
import { cn } from '../../lib/utils';

export function BrightloopLogo({
  className,
  size = 'md',
  showSubtitle = true,
  iconOnly = false,
  variant = 'default', // 'default' | 'on-dark' | 'on-light'
}) {
  // Dimension presets
  const sizeClasses = {
    sm: {
      svg: 'w-7 h-7',
      title: 'text-sm',
      subtitle: 'text-[8px] tracking-[0.22em]',
      gap: 'gap-2',
    },
    md: {
      svg: 'w-9 h-9',
      title: 'text-base',
      subtitle: 'text-[9px] tracking-[0.25em]',
      gap: 'gap-2.5',
    },
    lg: {
      svg: 'w-11 h-11',
      title: 'text-xl',
      subtitle: 'text-[10px] tracking-[0.28em]',
      gap: 'gap-3',
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={cn('flex items-center select-none', currentSize.gap, className)}>
      {/* Original Abstract Connected-Loop / Infinity Symbol */}
      <div className={cn('relative shrink-0 flex items-center justify-center', currentSize.svg)}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Primary Golden Yellow Loop Gradient */}
            <linearGradient id="blLoopGrad1" x1="4" y1="8" x2="36" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Subtle Core Shimmer */}
            <linearGradient id="blLoopCore" x1="12" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Background container gradient */}
            <linearGradient id="blBadgeBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E2024" />
              <stop offset="100%" stopColor="#121417" />
            </linearGradient>
          </defs>

          {/* Sleek Dark Emblem Base */}
          <rect width="40" height="40" rx="10" fill="url(#blBadgeBg)" />
          <rect
            width="39"
            height="39"
            x="0.5"
            y="0.5"
            rx="9.5"
            stroke="#F59E0B"
            strokeOpacity="0.25"
            strokeWidth="1"
          />

          {/* Abstract Connected Infinity Loop Path */}
          {/* Loop 1: Left lobe curves smoothly through the crossover node to the Right lobe */}
          <path
            d="M 12 20 C 12 14.5, 17.5 14.5, 20 20 C 22.5 25.5, 28 25.5, 28 20 C 28 14.5, 22.5 14.5, 20 20 C 17.5 25.5, 12 25.5, 12 20 Z"
            fill="none"
            stroke="url(#blLoopGrad1)"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Accent Flow Orbital Dots */}
          <circle cx="20" cy="20" r="2" fill="url(#blLoopCore)" />
          <circle cx="12" cy="17" r="1.2" fill="#FEF3C7" />
          <circle cx="28" cy="23" r="1.2" fill="#FEF3C7" />
        </svg>
      </div>

      {/* Brand Name & Subtitle */}
      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={cn(
                'font-bold tracking-tight',
                currentSize.title,
                variant === 'on-dark'
                  ? 'text-white'
                  : variant === 'on-light'
                  ? 'text-stone-900'
                  : 'text-stone-900 dark:text-white'
              )}
            >
              Brightloop
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          </div>

          {showSubtitle && (
            <span
              className={cn(
                'font-bold uppercase mt-1',
                currentSize.subtitle,
                variant === 'on-dark'
                  ? 'text-amber-400'
                  : variant === 'on-light'
                  ? 'text-amber-600'
                  : 'text-amber-600 dark:text-amber-400'
              )}
            >
              SOFTWARE
            </span>
          )}
        </div>
      )}
    </div>
  );
}
