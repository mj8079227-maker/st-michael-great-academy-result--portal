import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PublicSchoolConfig, VerificationResponse, StudentResult } from '../types';
import { verifyResult } from '../lib/api';

interface PublicHomeProps {
  config: PublicSchoolConfig | null;
  onResultVerified: (result: StudentResult, schoolSettings: PublicSchoolConfig) => void;
  onOpenAdminLogin?: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  config,
  onResultVerified,
  onOpenAdminLogin,
}) => {
  const [studentFullName, setStudentFullName] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const schoolName = config?.schoolName || 'ST. MICHAEL GREAT ACADEMY';
  const established = config?.established || 2023;
  const portalTitle = config?.portalTitle || 'OFFICIAL RESULT PORTAL';
  const motto = config?.motto || 'Learning is fun';
  const logoUrl = config?.logoUrl || '/logo.png';
  const currentSession = config?.currentSession || '2026/2027';
  const currentTerm = config?.currentTerm || 'First Term';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Exact prompt requirement:
    // If the student name or PIN fields are empty, display exactly:
    // "Please enter your full name and result PIN."
    if (!studentFullName.trim() || !pin.trim()) {
      setErrorMessage('Please enter your full name and result PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const response: VerificationResponse = await verifyResult(studentFullName.trim(), pin.trim());

      if (response.success && response.result) {
        // Exact prompt requirement:
        // When verification succeeds, display exactly: "Result verified successfully."
        setSuccessMessage('Result verified successfully.');

        // Celebratory confetti animation
        try {
          confetti({
            particleCount: 90,
            spread: 65,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff', '#1e3a8a'],
          });
        } catch {
          // Gracefully continue
        }

        // Smooth transition to result sheet
        setTimeout(() => {
          if (response.result && (response.schoolSettings || config)) {
            onResultVerified(response.result, response.schoolSettings || config!);
          }
        }, 700);
      } else {
        setErrorMessage(
          response.message ||
            'Incorrect student name or PIN. Please check your details and try again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col justify-between overflow-hidden bg-[#060e1d]">
      {/* Background Graphic Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-amber-600/15 blur-3xl"></div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Academic Verification Card */}
        <div className="w-full max-w-lg rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0b1730]/95 to-[#081226]/95 p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-md">
          {/* Official Crest & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-400/40 bg-[#060d1b] p-2 shadow-xl shadow-black/60">
              <img
                src={logoUrl}
                alt={schoolName}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
              <div className="absolute -bottom-2 -right-2 rounded-full border border-amber-400/50 bg-amber-500 p-1 text-slate-950 shadow">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>

            <h2 className="font-['Cinzel',serif] text-xl font-black tracking-wide text-amber-300 sm:text-2xl">
              {schoolName}
            </h2>

            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200/90">
              <span>Established {established}</span>
              <span className="text-amber-500/60">•</span>
              <span className="text-slate-300">{portalTitle}</span>
            </div>

            {/* School Motto Banner ("Learning is fun") */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-200">
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>
                School motto: <strong className="italic font-serif">"{motto}"</strong>
              </span>
            </div>

            {/* Academic Session & Term Indicator */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-amber-400/70" />
              <span>Academic Calendar:</span>
              <span className="text-amber-300">{currentSession}</span>
              <span>({currentTerm})</span>
            </div>
          </div>

          <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>

          {/* 3-Step Instruction Section */}
          <div className="mb-5 rounded-2xl border border-amber-500/25 bg-[#060c18]/90 p-4 shadow-inner">
            <div className="space-y-2 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-slate-950">
                  1
                </span>
                <span>Step 1: Fill in your full name.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-slate-950">
                  2
                </span>
                <span>Step 2: Enter your Result PIN.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-slate-950">
                  3
                </span>
                <span>Step 3: Press CHECK RESULT to confirm.</span>
              </div>
            </div>

            <p className="mt-3 border-t border-slate-800/90 pt-2.5 text-[11px] font-medium leading-relaxed text-amber-200/90">
              After your result opens, you can print it or save it as a PDF/file on your phone.
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="studentFullName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Student Full Name <span className="text-amber-400">*</span>
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="studentFullName"
                  type="text"
                  value={studentFullName}
                  onChange={(e) => setStudentFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-700/80 bg-[#060e1d]/90 px-3.5 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="pin"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Result PIN <span className="text-amber-400">*</span>
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.trim())}
                  placeholder="Enter your Result PIN"
                  className="w-full rounded-xl border border-slate-700/80 bg-[#060e1d]/90 px-3.5 py-3 font-mono text-sm tracking-widest text-amber-300 placeholder-slate-500 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-amber-300 transition cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-200 animate-in fade-in"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="font-semibold leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* CHECK RESULT Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>CHECK RESULT</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-[#040813] py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {schoolName}. Established {established}. All rights reserved.</p>
          <p className="text-amber-400/70 font-serif italic text-[11px]">"{motto}"</p>
        </div>
      </footer>
    </div>
  );
};
