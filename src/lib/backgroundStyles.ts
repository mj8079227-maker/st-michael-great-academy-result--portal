import React from 'react';
import { ResultBackground } from '../types';

export function getBackgroundClassOrStyle(bg: ResultBackground | undefined): {
  className: string;
  style?: React.CSSProperties;
} {
  if (!bg) {
    return { className: 'bg-[#fdfbf7] border-amber-800/30' };
  }

  if (bg.type === 'uploaded' && bg.url) {
    return {
      className: 'bg-cover bg-center border-amber-700/40',
      style: {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.94)), url("${bg.url}")`,
      },
    };
  }

  switch (bg.themeStyle) {
    case 'royal-navy':
      return {
        className: 'bg-gradient-to-b from-[#09152e] via-[#0d1d3d] to-[#071226] text-amber-100 border-amber-500/50 shadow-2xl',
      };
    case 'ivory-crest':
      return {
        className: 'bg-[#faf8f2] text-slate-900 border-amber-700/30 shadow-xl',
      };
    case 'golden-academic':
      return {
        className: 'bg-gradient-to-br from-[#fffdf5] via-[#fef9e7] to-[#fbf4d9] text-slate-900 border-amber-600/40 shadow-xl',
      };
    case 'vintage-diploma':
      return {
        className: 'bg-[#f7f2e7] text-[#2c2416] border-[#8c734b] shadow-2xl',
      };
    case 'renaissance-scroll':
      return {
        className: 'bg-gradient-to-b from-[#fbf8f0] to-[#f4ede0] text-slate-900 border-amber-800/40 shadow-2xl',
      };
    case 'modern-minimalist':
      return {
        className: 'bg-white text-slate-900 border-slate-300 shadow-xl',
      };
    case 'regal-damask':
      return {
        className: 'bg-[#fbf9f4] text-slate-900 border-amber-600/30 shadow-xl',
      };
    case 'emerald-academic':
      return {
        className: 'bg-gradient-to-b from-[#0a2321] via-[#0e2c2a] to-[#061816] text-amber-100 border-emerald-500/50 shadow-2xl',
      };
    case 'celestial-stars':
      return {
        className: 'bg-gradient-to-b from-[#0b162c] to-[#070e1c] text-amber-100 border-amber-400/50 shadow-2xl',
      };
    case 'classic-monogram':
      return {
        className: 'bg-[#fcfaf5] text-slate-900 border-amber-700/30 shadow-xl',
      };
    case 'honors-ribbon':
      return {
        className: 'bg-gradient-to-br from-[#fffef7] to-[#f7f2de] text-slate-900 border-amber-500/40 shadow-xl',
      };
    case 'parchment':
    default:
      return {
        className: 'bg-[#fdfbf6] text-slate-900 border-amber-700/30 shadow-xl',
      };
  }
}
