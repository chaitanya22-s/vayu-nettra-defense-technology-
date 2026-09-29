/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface VayuNetraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showText?: boolean;
  variant?: 'compact' | 'full' | 'icon-only';
  subtitle?: string;
}

export const VayuNetraLogo: React.FC<VayuNetraLogoProps> = ({
  size = 'md',
  animated = true,
  className = '',
  showText = false,
  variant = 'compact',
  subtitle,
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', textTitle: 'text-sm sm:text-base', textSub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', textTitle: 'text-base sm:text-lg', textSub: 'text-[10px]' },
    lg: { icon: 'w-16 h-16', textTitle: 'text-2xl sm:text-3xl', textSub: 'text-xs' },
    xl: { icon: 'w-24 h-24', textTitle: 'text-3xl sm:text-4xl', textSub: 'text-sm' },
  };

  const { icon, textTitle, textSub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* VAYU-NETRA Premium Emblem SVG */}
      <div className={`relative ${icon} shrink-0 flex items-center justify-center`}>
        {/* Multi-layered ambient intelligence glow */}
        <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-md" />
        <div className="absolute inset-2 bg-emerald-500/15 rounded-full blur-sm" />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.55)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="vn-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="vn-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="vn-wing-grad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
            </linearGradient>

            <radialGradient id="vn-sweep-wedge" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="vn-pupil-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="45%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </radialGradient>
          </defs>

          {/* 1. Outer Telemetry Housing Ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="rgba(14, 165, 233, 0.3)"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />

          {/* 2. Cardinal Azimuth Ticks */}
          <line x1="50" y1="2" x2="50" y2="7" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="93" x2="50" y2="98" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="50" x2="7" y2="50" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
          <line x1="93" y1="50" x2="98" y2="50" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />

          {/* 3. AI Neural Network Synapses & Nodes (Digital Intelligence Motif) */}
          {/* Top neural branches */}
          <line x1="30" y1="24" x2="50" y2="16" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="50" y1="16" x2="70" y2="24" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="30" cy="24" r="1.8" fill="#38bdf8" />
          <circle cx="50" cy="16" r="2.2" fill="#22d3ee" />
          <circle cx="70" cy="24" r="1.8" fill="#38bdf8" />

          {/* Bottom neural branches */}
          <line x1="30" y1="76" x2="50" y2="84" stroke="rgba(52, 211, 153, 0.45)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="50" y1="84" x2="70" y2="76" stroke="rgba(52, 211, 153, 0.45)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="30" cy="76" r="1.8" fill="#34d399" />
          <circle cx="50" cy="84" r="2.2" fill="#10b981" />
          <circle cx="70" cy="76" r="1.8" fill="#34d399" />

          {/* 4. Abstract "Netra" (All-Seeing Spectrum Eye Aperture) */}
          <path
            d="M 12,50 Q 50,18 88,50 Q 50,82 12,50 Z"
            stroke="url(#vn-cyan-grad)"
            strokeWidth="2.2"
            fill="#030816"
            fillOpacity="0.85"
            strokeLinejoin="round"
          />

          {/* Phased Array Aperture Crests */}
          <path
            d="M 20,45 Q 50,23 80,45"
            stroke="#38bdf8"
            strokeWidth="1.4"
            strokeDasharray="3 3"
            opacity="0.85"
          />
          <path
            d="M 20,55 Q 50,77 80,55"
            stroke="#10b981"
            strokeWidth="1.4"
            strokeDasharray="3 3"
            opacity="0.85"
          />

          {/* 5. Concentric Radar Range & Frequency Iris Rings */}
          <circle
            cx="50"
            cy="50"
            r="23"
            stroke="rgba(6, 182, 212, 0.5)"
            strokeWidth="1.2"
          />
          <circle
            cx="50"
            cy="50"
            r="15"
            stroke="rgba(16, 185, 129, 0.55)"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />

          {/* 6. Rotating Phased-Array Radar Sweep Arc & Beam */}
          <g className={animated ? 'origin-center animate-radar-sweep' : ''}>
            <path
              d="M 50,50 L 82,32 A 23 23 0 0 1 85,50 Z"
              fill="url(#vn-sweep-wedge)"
            />
            <line
              x1="50"
              y1="50"
              x2="85"
              y2="50"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="round"
              filter="drop-shadow(0 0 4px #22d3ee)"
            />
          </g>

          {/* 7. Spectrum Waveform Pulse Traversing Across the Core */}
          <path
            d="M 26,50 Q 32,41 38,50 T 50,50 T 62,50 T 74,50"
            stroke="rgba(56, 189, 248, 0.75)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* 8. Iris Center Target Reticle & Neural Core Pupil */}
          <circle
            cx="50"
            cy="50"
            r="8"
            fill="url(#vn-pupil-glow)"
            stroke="#67e8f9"
            strokeWidth="1.6"
          />
          <circle cx="50" cy="50" r="3" fill="#ffffff" />

          {/* Target Reticle Crosshairs */}
          <line x1="50" y1="38" x2="50" y2="44" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="50" y1="56" x2="50" y2="62" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="38" y1="50" x2="44" y2="50" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="56" y1="50" x2="62" y2="50" stroke="#ffffff" strokeWidth="1.2" />

          {/* 9. Synthetic Target Intercept Pulse (Detected Signal) */}
          <circle
            cx="64"
            cy="39"
            r="2.5"
            fill="#34d399"
            className={animated ? 'animate-ping origin-center' : ''}
          />
          <circle cx="64" cy="39" r="1.8" fill="#10b981" />
        </svg>
      </div>

      {/* Integrated Brand Text */}
      {showText && (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={`font-tech ${textTitle} font-black tracking-wider text-slate-100 uppercase`}>
              VAYU<span className="text-cyan-400">-NETRA</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                INTELLIGENCE
              </span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
              EW SIMULATION
            </span>
          </div>
          <p className={`${textSub} text-cyan-300/80 font-sans tracking-tight`}>
            {subtitle || 'Adaptive Intelligence for Spectrum Surveillance Simulation'}
          </p>
          {variant === 'full' && (
            <p className="text-[9px] font-mono text-slate-500 tracking-wider">
              Observe • Learn • Predict • Schedule
            </p>
          )}
        </div>
      )}
    </div>
  );
};
