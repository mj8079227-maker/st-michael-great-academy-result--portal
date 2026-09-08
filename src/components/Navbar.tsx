import React from 'react';
import { Lock, Wifi, WifiOff } from 'lucide-react';
import { PublicSchoolConfig } from '../types';

interface NavbarProps {
  config: PublicSchoolConfig | null;
  isOnline: boolean;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  isOnline,
  onOpenAdminLogin,
}) => {
  const schoolName = config?.schoolName || 'ST. MICHAEL GREAT ACADEMY';
  const established = config?.established || 2023;
  const portalTitle = config?.portalTitle || 'OFFICIAL RESULT PORTAL';
  const motto = config?.motto || 'Learning is fun';
  const logoUrl = config?.logoUrl || '/logo.png';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#081326]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Branding & Crest */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-400/30 bg-[#060e1d] p-1 shadow-lg shadow-black/40">
            <img
              src={logoUrl}
              alt="School Logo"
              className="h-full w-full object-contain"
              onError={(e) => {
                // Fallback if custom logo fails to load
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-['Cinzel',serif] text-base font-extrabold tracking-wide text-amber-300 sm:text-lg">
                {schoolName}
              </h1>
              <span className="inline-flex items-center rounded-md border border-amber-400/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-200">
                Est. {established}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold uppercase tracking-wider text-slate-200">
                {portalTitle}
              </span>
              <span className="text-amber-400/60">•</span>
              <span className="italic text-amber-200/80">"{motto}"</span>
            </div>
          </div>
        </div>

        {/* Right: Discreet Admin Access & Status Badge */}
        <div className="flex items-center gap-3">
          {/* Online/Offline Status Indicator */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
              isOnline
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300 animate-pulse'
            }`}
            title={isOnline ? 'System is online' : 'System is running offline (cached)'}
          >
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Discreet Functional Padlock Admin Access */}
          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700/80 bg-[#0d1d3a]/80 p-2 text-amber-400 transition hover:border-amber-400 hover:bg-[#13284f] hover:text-amber-300 active:scale-95 cursor-pointer"
            title="Administrator Login"
            aria-label="Administrator Login"
          >
            <Lock className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
