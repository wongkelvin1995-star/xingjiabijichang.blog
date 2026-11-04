import React from 'react';

interface ThumbnailProps {
  type: 'torii' | 'pagoda' | 'castle' | 'fuji' | 'street' | 'shrine' | 'sakura_lake' | 'night_bay';
  className?: string;
}

export function AnimeThumbnail({ type, className = 'w-full h-36 object-cover' }: ThumbnailProps) {
  switch (type) {
    case 'torii':
      return (
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyTorii" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E1065" />
              <stop offset="60%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>
          <rect width="400" height="200" fill="url(#skyTorii)" />
          {/* Distant Fuji */}
          <path d="M260,140 L210,50 L160,140 Z" fill="#6B21A8" />
          <path d="M225,50 L210,50 L195,50 L185,75 L235,75 Z" fill="#FCE7F3" />
          {/* Water */}
          <rect y="130" width="400" height="70" fill="#3B0764" />
          {/* Red Torii */}
          <g transform="translate(180, 70)">
            <rect x="0" y="20" width="6" height="55" fill="#EF4444" />
            <rect x="36" y="20" width="6" height="55" fill="#EF4444" />
            <rect x="-6" y="32" width="54" height="4" fill="#EF4444" />
            <path d="M-10,20 Q21,24 52,20 L54,16 Q21,20 -12,16 Z" fill="#EF4444" />
            <rect x="-14" y="14" width="70" height="2" fill="#18181B" />
          </g>
          {/* Foreground Sakura Branch */}
          <path d="M0,20 Q60,50 110,20" fill="none" stroke="#262626" strokeWidth="4" />
          <circle cx="40" cy="30" r="10" fill="#F9A8D4" opacity="0.9" />
          <circle cx="80" cy="35" r="12" fill="#F472B6" opacity="0.9" />
          <circle cx="110" cy="20" r="8" fill="#FFF1F2" opacity="0.95" />
        </svg>
      );

    case 'pagoda':
      return (
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyPagoda" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="50%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#DB2777" />
            </linearGradient>
          </defs>
          <rect width="400" height="200" fill="url(#skyPagoda)" />
          {/* Sunset Sun */}
          <circle cx="280" cy="110" r="35" fill="#FDF2F8" opacity="0.75" />
          {/* Fuji Silhouette */}
          <path d="M350,150 L280,65 L210,150 Z" fill="#581C87" opacity="0.7" />
          <path d="M295,65 L280,65 L265,65 L255,85 L305,85 Z" fill="#FDF2F8" opacity="0.9" />
          {/* Pagoda Tiers */}
          <g transform="translate(60, 40)">
            <path d="M40,50 L10,65 L70,65 Z" fill="#18181B" />
            <rect x="25" y="65" width="30" height="15" fill="#451A03" />
            <path d="M40,75 L-5,95 L85,95 Z" fill="#18181B" />
            <rect x="20" y="95" width="40" height="20" fill="#451A03" />
            <path d="M40,110 L-20,135 L100,135 Z" fill="#18181B" />
            <rect x="15" y="135" width="50" height="25" fill="#451A03" />
            {/* Glowing Lantern */}
            <circle cx="95" cy="140" r="6" fill="#FBBF24" />
          </g>
          {/* Sakura clusters */}
          <circle cx="340" cy="40" r="16" fill="#F472B6" opacity="0.8" />
          <circle cx="370" cy="65" r="14" fill="#F9A8D4" opacity="0.85" />
        </svg>
      );

    case 'castle':
      return (
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyCastle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="50%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>
          <rect width="400" height="200" fill="url(#skyCastle)" />
          {/* Castle Base */}
          <polygon points="120,200 150,130 250,130 280,200" fill="#334155" />
          {/* Castle Main Keep (Tenshudai) */}
          <g transform="translate(160, 60)">
            <rect x="10" y="45" width="60" height="30" fill="#F8FAFC" />
            <path d="M-5,45 L40,25 L85,45 Z" fill="#0F172A" />
            <rect x="20" y="15" width="40" height="20" fill="#F8FAFC" />
            <path d="M5,15 L40,0 L75,15 Z" fill="#0F172A" />
            {/* Golden Shachihoko ornament */}
            <circle cx="5" cy="2" r="3" fill="#F59E0B" />
            <circle cx="75" cy="2" r="3" fill="#F59E0B" />
          </g>
          {/* Surrounding Pink Cherry Blossoms */}
          <circle cx="90" cy="140" r="28" fill="#F472B6" opacity="0.85" />
          <circle cx="130" cy="155" r="22" fill="#F9A8D4" opacity="0.9" />
          <circle cx="280" cy="145" r="30" fill="#F472B6" opacity="0.85" />
          <circle cx="320" cy="160" r="24" fill="#FBCFE8" opacity="0.9" />
        </svg>
      );

    case 'fuji':
      return (
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyFujiCard" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="40%" stopColor="#3B0764" />
              <stop offset="85%" stopColor="#C026D3" />
              <stop offset="100%" stopColor="#FBCFE8" />
            </linearGradient>
          </defs>
          <rect width="400" height="200" fill="url(#skyFujiCard)" />
          {/* Huge Majestic Fuji */}
          <g transform="translate(80, 20)">
            <path d="M300,160 L120,40 L-60,160 Z" fill="#4C1D95" />
            <path d="M120,40 L90,75 Q120,85 150,75 Z" fill="#FFFFFF" />
          </g>
          {/* Lake Kawaguchiko reflection */}
          <rect y="140" width="400" height="60" fill="#2E1065" opacity="0.9" />
          <ellipse cx="200" cy="155" rx="80" ry="6" fill="#F472B6" opacity="0.3" />
          {/* Small torii on lake */}
          <rect x="290" y="125" width="3" height="25" fill="#EF4444" />
          <rect x="305" y="125" width="3" height="25" fill="#EF4444" />
          <rect x="286" y="128" width="26" height="2" fill="#EF4444" />
          {/* Sakura border */}
          <circle cx="20" cy="30" r="16" fill="#F472B6" opacity="0.85" />
          <circle cx="45" cy="15" r="14" fill="#FBCFE8" opacity="0.9" />
        </svg>
      );

    case 'street':
      return (
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyStreet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="60%" stopColor="#581C87" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>
          <rect width="400" height="200" fill="url(#skyStreet)" />
          {/* Traditional Edo Machiya House Silhouettes */}
          <polygon points="0,200 0,90 80,70 120,110 120,200" fill="#18181B" />
          <polygon points="280,200 280,110 320,70 400,90 400,200" fill="#18181B" />
          {/* Distant street alley perspective */}
          <polygon points="120,200 180,120 220,120 280,200" fill="#27272A" />
          {/* Glowing Red & Amber Paper Lanterns (Chōchin) */}
          <circle cx="70" cy="115" r="8" fill="#FBBF24" />
          <circle cx="70" cy="115" r="18" fill="#FBBF24" opacity="0.3" />
          <circle cx="330" cy="115" r="8" fill="#F43F5E" />
          <circle cx="330" cy="115" r="18" fill="#F43F5E" opacity="0.3" />
          {/* Sakura canopy overhead */}
          <circle cx="170" cy="35" r="22" fill="#F472B6" opacity="0.85" />
          <circle cx="210" cy="25" r="25" fill="#F9A8D4" opacity="0.9" />
          <circle cx="245" cy="45" r="18" fill="#FBCFE8" opacity="0.85" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" fill="#4C1D95" />
          <circle cx="200" cy="100" r="40" fill="#F472B6" />
        </svg>
      );
  }
}
