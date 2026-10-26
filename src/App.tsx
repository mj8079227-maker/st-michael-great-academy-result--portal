import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PublicHome } from './components/PublicHome';
import { ResultDisplay } from './components/ResultDisplay';
import { PinCardModal } from './components/PinCardModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminLayout, AdminSection } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { ResultManagement } from './components/admin/ResultManagement';
import { PinManagement } from './components/admin/PinManagement';
import { GradingSettings } from './components/admin/GradingSettings';
import { ResultBackgroundSettings } from './components/admin/ResultBackgroundSettings';
import { AcademicSessionSettings } from './components/admin/AcademicSessionSettings';
import { SchoolSettings } from './components/admin/SchoolSettings';
import { ResultMonitoring } from './components/admin/ResultMonitoring';
import { AdminSecurity } from './components/admin/AdminSecurity';

import {
  PublicSchoolConfig,
  StudentResult,
  PinRecord,
  Student,
  GradeScale,
  ResultBackground,
  AcademicSession,
  SchoolSettings as SchoolSettingsType,
  ResultCheckLog,
} from './types';
import {
  getPublicConfig,
  getAdminData,
  adminLogout,
  getAdminToken,
  syncDatabase,
} from './lib/api';

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeView, setActiveView] = useState<'home' | 'result' | 'admin'>('home');
  // Load cached public config immediately on startup for instant zero-lag rendering
  const [publicConfig, setPublicConfig] = useState<PublicSchoolConfig | null>(() => {
    try {
      const cached = localStorage.getItem('smga_public_config_cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return null;
  });

  // Result verification viewing state
  const [viewingResult, setViewingResult] = useState<StudentResult | null>(null);

  // Pin Card modal state
  const [pinCardRecord, setPinCardRecord] = useState<PinRecord | null>(null);

  // Admin authentication & navigation state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');

  // Intercept browser back/forward navigation to ensure locked admin state
  useEffect(() => {
    const handlePopState = () => {
      adminLogout().catch(() => {});
      setIsAdminLoggedIn(false);
      setActiveView('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Admin Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [pins, setPins] = useState<PinRecord[]>([]);
  const [gradeScales, setGradeScales] = useState<GradeScale[]>([]);
  const [backgrounds, setBackgrounds] = useState<ResultBackground[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [settings, setSettings] = useState<SchoolSettingsType | null>(null);
  const [logs, setLogs] = useState<ResultCheckLog[]>([]);

  // Monitor network online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker if available
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silently ignore if worker registration fails
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch public configuration
  const loadPublicConfig = useCallback(async () => {
    try {
      const cfg = await getPublicConfig();
      setPublicConfig(cfg);
      try {
        localStorage.setItem('smga_public_config_cache', JSON.stringify(cfg));
      } catch {}
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadPublicConfig();
  }, [loadPublicConfig]);

  // Load Admin Data
  const loadAdminData = useCallback(async () => {
    if (!getAdminToken()) {
      setIsAdminLoggedIn(false);
      return;
    }

    try {
      const data = await getAdminData();
      setStudents(data.students || []);
      setResults(data.results || []);
      setPins(data.pins || []);
      setGradeScales(data.gradeScales || []);
      setBackgrounds(data.backgrounds || []);
      setSessions(data.sessions || []);
      setSettings(data.settings || null);
      setLogs(data.logs || []);
      setIsAdminLoggedIn(true);

      // Also refresh public config to keep logos/mottos in sync
      if (data.settings) {
        setPublicConfig((prev) => {
          const updated = {
            ...(prev || {}),
            schoolName: data.settings.schoolName,
            motto: data.settings.motto,
            portalTitle: data.settings.portalTitle,
            established: data.settings.established,
            logoUrl: data.settings.logoUrl,
            currentSession: data.settings.currentSession,
            currentTerm: data.settings.currentTerm,
            activeBackground: data.backgrounds?.find((b: ResultBackground) => b.isActive),
          };
          try {
            localStorage.setItem('smga_public_config_cache', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err: any) {
      if (err.message?.includes('Session expired') || err.message?.includes('unauthorized')) {
        setIsAdminLoggedIn(false);
        setActiveView('home');
      }
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAdminData();
    }
  }, [isAdminLoggedIn, loadAdminData]);

  // Handler when a student verifies result
  const handleResultVerified = (res: StudentResult, cfg: PublicSchoolConfig) => {
    setViewingResult(res);
    setPublicConfig(cfg);
    setActiveView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler when admin logs in successfully
  const handleAdminLoginSuccess = async () => {
    setActiveView('admin');
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    await loadAdminData();
  };

  // Handler when admin logs out (destroys token and locks session)
  const handleAdminLogout = async () => {
    await adminLogout();
    setIsAdminLoggedIn(false);
    setActiveView('home');
    // Lock session and replace history to prevent back-button access
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Handler when admin exits portal (locks session so back-button cannot re-enter without login)
  const handleExitPortal = async () => {
    await adminLogout();
    setIsAdminLoggedIn(false);
    setActiveView('home');
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Handler for manual DB sync
  const handleSync = async () => {
    await syncDatabase();
    await loadAdminData();
    await loadPublicConfig();
  };

  // Result display back action
  const handleBackToHome = () => {
    setViewingResult(null);
    setActiveView('home');
    loadPublicConfig();
  };

  // Shortcut to view result certificate directly from admin
  const handleAdminViewResult = (res: StudentResult) => {
    setViewingResult(res);
    setActiveView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#060e1d] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* If in admin view and authenticated, render AdminLayout with selected Admin section */}
      {activeView === 'admin' && isAdminLoggedIn && settings ? (
        <AdminLayout
          currentSection={adminSection}
          onSelectSection={(sec) => setAdminSection(sec)}
          onLogout={handleAdminLogout}
          onSync={handleSync}
          onExitPortal={handleExitPortal}
          settings={settings}
          isOnline={isOnline}
        >
          {adminSection === 'dashboard' && (
            <AdminDashboard
              students={students}
              results={results}
              pins={pins}
              settings={settings}
              onNavigate={(sec) => setAdminSection(sec)}
            />
          )}

          {adminSection === 'students' && (
            <StudentManagement
              students={students}
              onRefreshData={loadAdminData}
            />
          )}

          {adminSection === 'results' && (
            <ResultManagement
              results={results}
              students={students}
              pins={pins}
              settings={settings}
              gradeScales={gradeScales}
              sessions={sessions}
              onRefreshData={loadAdminData}
              onViewResult={handleAdminViewResult}
              onOpenPinCard={(pin) => setPinCardRecord(pin)}
            />
          )}

          {adminSection === 'pins' && (
            <PinManagement
              pins={pins}
              settings={settings}
              onRefreshData={loadAdminData}
              onOpenPinCard={(pin) => setPinCardRecord(pin)}
            />
          )}

          {adminSection === 'grading' && (
            <GradingSettings
              gradeScales={gradeScales}
              settings={settings}
              onRefreshData={loadAdminData}
            />
          )}

          {adminSection === 'backgrounds' && (
            <ResultBackgroundSettings
              backgrounds={backgrounds}
              onRefreshData={loadAdminData}
            />
          )}

          {adminSection === 'sessions' && (
            <AcademicSessionSettings
              sessions={sessions}
              settings={settings}
              onRefreshData={loadAdminData}
            />
          )}

          {adminSection === 'settings' && (
            <SchoolSettings
              settings={settings}
              onRefreshData={loadAdminData}
            />
          )}

          {adminSection === 'monitoring' && (
            <ResultMonitoring
              logs={logs}
              onRefreshData={loadAdminData}
            />
          )}

          {adminSection === 'security' && (
            <AdminSecurity 
              students={students}
              results={results}
              pins={pins}
              settings={settings}
              gradeScales={gradeScales}
              sessions={sessions}
              backgrounds={backgrounds}
              onRefreshData={loadAdminData} 
            />
          )}
        </AdminLayout>
      ) : activeView === 'result' && viewingResult && publicConfig ? (
        <>
          <ResultDisplay
            result={viewingResult}
            config={publicConfig}
            onBack={handleBackToHome}
          />
        </>
      ) : (
        /* Default Public Portal View */
        <>
          <Navbar
            config={publicConfig}
            isOnline={isOnline}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />

          <PublicHome
            config={publicConfig}
            onResultVerified={handleResultVerified}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        </>
      )}

      {/* Admin Login Modal (Discreet trigger) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Printable PIN Card Modal */}
      {pinCardRecord && (
        <PinCardModal
          pinRecord={pinCardRecord}
          config={publicConfig}
          onClose={() => setPinCardRecord(null)}
        />
      )}
    </div>
  );
}
