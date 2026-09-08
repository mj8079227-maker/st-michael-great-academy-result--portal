import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  KeyRound,
  GraduationCap,
  Image as ImageIcon,
  Calendar,
  Settings,
  Activity,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { SchoolSettings } from '../../types';

export type AdminSection =
  | 'dashboard'
  | 'students'
  | 'results'
  | 'pins'
  | 'grading'
  | 'backgrounds'
  | 'sessions'
  | 'settings'
  | 'monitoring'
  | 'security';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onLogout: () => void;
  onSync: () => Promise<void>;
  onExitPortal: () => void;
  settings: SchoolSettings;
  isOnline: boolean;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onSelectSection,
  onLogout,
  onSync,
  onExitPortal,
  settings,
  isOnline,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'students', label: 'Student Management', icon: <Users className="h-4 w-4" /> },
    { id: 'results', label: 'Results', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { id: 'pins', label: 'PIN Management', icon: <KeyRound className="h-4 w-4" /> },
    { id: 'grading', label: 'Grading / Grade Settings', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'backgrounds', label: 'Result Background', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'sessions', label: 'Academic Session & Term', icon: <Calendar className="h-4 w-4" /> },
    { id: 'settings', label: 'Result / School Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'monitoring', label: 'Result Monitoring', icon: <Activity className="h-4 w-4" /> },
    { id: 'security', label: 'Admin Security', icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncStatus('Synchronizing...');
    try {
      await onSync();
      setSyncStatus('Synced successfully');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('Sync failed');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelect = (section: AdminSection) => {
    onSelectSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#071124] text-slate-100 flex flex-col">
      {/* STAFF ADMINISTRATION HEADER */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#09152e]/95 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Mobile Toggle & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-[#060e1d] p-1">
                <img
                  src={settings.logoUrl || '/logo.png'}
                  alt="School Crest"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-['Cinzel',serif] text-sm sm:text-base font-extrabold text-amber-300">
                    {settings.schoolName}
                  </h1>
                  <span className="hidden md:inline-flex rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                    STAFF PORTAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-serif italic">
                  "{settings.motto}"
                </p>
              </div>
            </div>
          </div>

          {/* Right: SYNC and red LOGOUT button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online/Offline status */}
            <div
              className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                isOnline
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>

            {/* SYNC button */}
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#0d1d3a] px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-amber-400/50 hover:bg-[#12254a] active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Synchronize database records"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">SYNC</span>
            </button>

            {syncStatus && (
              <span className="hidden lg:inline text-xs text-amber-300 font-medium">
                {syncStatus}
              </span>
            )}

            {/* View Public Portal Button */}
            <button
              onClick={onExitPortal}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
              title="Leave Admin and Return to Public Portal (locks session automatically)"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>View Public Portal</span>
            </button>

            {/* LOGOUT (Clearly visible and RED as specified in prompt) */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500 bg-red-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md shadow-red-950/50 hover:bg-red-500 active:scale-95 cursor-pointer"
              title="End Administrator Session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-800 bg-[#081226]/80 p-4">
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Administrative Menu
          </div>
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-amber-200'
                  }`}
                >
                  <span className={isActive ? 'text-slate-950' : 'text-amber-400/80'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MOBILE DRAWER (Covers/hides underlying page, closes upon selection, displays ONLY selected section) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-[#081226] border-r border-amber-500/30 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-['Cinzel',serif] text-sm font-black text-amber-300">
                    PORTAL MENU
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold transition ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800 mt-2 space-y-2">
                <button
                  onClick={onExitPortal}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>View Public Portal</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow"
                >
                  <LogOut className="h-4 w-4" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
