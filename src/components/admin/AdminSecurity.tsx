import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Database,
  Archive,
  Upload,
  HardDrive,
  Server,
  FileJson,
  Check,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';
import { changeAdminCredential, restoreDatabaseBackup } from '../../lib/api';
import {
  Student,
  StudentResult,
  PinRecord,
  SchoolSettings,
  GradeScale,
  AcademicSession,
  ResultBackground,
} from '../../types';

interface AdminSecurityProps {
  students?: Student[];
  results?: StudentResult[];
  pins?: PinRecord[];
  settings?: SchoolSettings;
  gradeScales?: GradeScale[];
  sessions?: AcademicSession[];
  backgrounds?: ResultBackground[];
  onRefreshData: () => Promise<void>;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({
  students = [],
  results = [],
  pins = [],
  settings,
  gradeScales = [],
  sessions = [],
  backgrounds = [],
  onRefreshData,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Backup & Restore states
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadCurrentDatabase = () => {
    try {
      const fullDb = {
        settings,
        students,
        results,
        pins,
        gradeScales,
        sessions,
        backgrounds,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(fullDb, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `st_michael_academy_database_live_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export current database: ' + err.message);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        'Are you sure you want to restore the portal database from this backup file? This will restore all students, results, PINs, and portal configurations from the selected backup.'
      )
    ) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsRestoring(true);
    setRestoreError(null);
    setRestoreMessage(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await restoreDatabaseBackup(parsed);
      setRestoreMessage(res.message || 'Database restored successfully.');
      await onRefreshData();
      setTimeout(() => setRestoreMessage(null), 8000);
    } catch (err: any) {
      setRestoreError(err.message || 'Failed to restore database from backup file.');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!oldPassword.trim()) {
      setErrorMessage('Please enter your current administrator password/PIN.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage('New password/PIN cannot be empty.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMessage('New password/PIN must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changeAdminCredential(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage('Administrator credential changed successfully. Keep your new password secure.');
      await onRefreshData();
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update administrator credential.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">ADMINISTRATOR SECURITY</h2>
          </div>
          <p className="text-xs text-slate-400">
            Update your private administrator password/PIN.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-amber-500/30 bg-[#0a152b] p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/30">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Change Admin Password / PIN</h3>
              <p className="text-xs text-slate-400">
                Ensure this credential remains confidential to prevent unauthorized access.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Current Admin Password / PIN <span className="text-red-400">*</span>
              </label>
              <div className="mt-1.5 relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                New Admin Password / PIN <span className="text-red-400">*</span>
              </label>
              <div className="mt-1.5 relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password or PIN"
                  className="w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Confirm New Admin Password / PIN <span className="text-red-400">*</span>
              </label>
              <div className="mt-1.5 relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password or PIN"
                  className="w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {statusMessage && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-400 bg-amber-500 px-4 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 cursor-pointer shadow-lg"
              >
                <Lock className="h-4 w-4" />
                <span>{isSubmitting ? 'Updating Credential...' : 'Update Admin Password'}</span>
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-[#060d1c] p-3 text-center text-[11px] text-slate-400">
            <p>
              This credential is never revealed to students, parents, or unauthorized visitors.
            </p>
          </div>
        </div>
      </div>

      {/* Complete Backup & Independent Ownership Package */}
      <div className="mt-8 rounded-2xl border border-amber-500/30 bg-[#0a152b] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/30">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Complete Backup & Independent Ownership Package
              </h3>
              <p className="text-xs text-slate-400">
                Download everything required to run this portal independently on any cloud host, VPS, or offline computer.
              </p>
            </div>
          </div>
        </div>

        {/* Status messages for restore */}
        {restoreMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{restoreMessage}</span>
          </div>
        )}

        {restoreError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{restoreError}</span>
          </div>
        )}

        {/* 3 Download Action Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Full Standalone Application ZIP */}
          <div className="rounded-xl border border-slate-700/70 bg-[#060e1d] p-5 flex flex-col justify-between hover:border-amber-500/50 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Full Source & Build
                </span>
                <Server className="h-4 w-4 text-slate-400" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-100">Complete Portal Package (.ZIP)</h4>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Contains complete React 19 frontend, Express backend, configuration files, full database with all active students, and the Standalone Hosting Guide.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800">
              <a
                href="/downloads/st_michael_great_academy_complete_portal_backup.zip"
                download="st_michael_great_academy_complete_portal_backup.zip"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition"
              >
                <Download className="h-4 w-4" />
                <span>Download Portal ZIP</span>
              </a>
            </div>
          </div>

          {/* Card 2: Database JSON Export */}
          <div className="rounded-xl border border-slate-700/70 bg-[#060e1d] p-5 flex flex-col justify-between hover:border-blue-500/50 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Raw Data Export
                </span>
                <FileJson className="h-4 w-4 text-slate-400" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-100">Live Database Export (.JSON)</h4>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Direct dynamic export of all {students.length} registered students in your school, all examination scorecards, scratch PINs, grading rules, and settings.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDownloadCurrentDatabase}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Live Database JSON ({students.length} Students)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Media & Branding Assets */}
          <div className="rounded-xl border border-slate-700/70 bg-[#060e1d] p-5 flex flex-col justify-between hover:border-emerald-500/50 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Branding Media
                </span>
                <ImageIcon className="h-4 w-4 text-slate-400" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-100">Official Media Assets (.ZIP)</h4>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Includes the official high-resolution red lion crest (<code className="text-amber-300">logo.png</code>, <code className="text-amber-300">school_logo.png</code>, <code className="text-amber-300">school_logo.jpg</code>) and web app manifest.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800">
              <a
                href="/downloads/st_michael_academy_branding_assets.zip"
                download="st_michael_academy_branding_assets.zip"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition"
              >
                <Download className="h-4 w-4" />
                <span>Download Media Assets</span>
              </a>
            </div>
          </div>
        </div>

        {/* Restore Database Section */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-[#060d1c] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Restore Database from JSON Backup
                </h4>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Accidentally lost data or moving to a new deployment? Select any valid <code className="text-amber-300">.json</code> database backup to restore instantly.
              </p>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleRestoreFile}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/50 bg-[#0e1d3d] px-4 py-2 text-xs font-bold text-amber-300 hover:bg-[#142954] active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                <span>{isRestoring ? 'Restoring Database...' : 'Select Backup JSON to Restore'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Launch Guide */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-[#060d1c] p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-amber-400" />
            <span>How to Run Independently Anywhere (3 Simple Steps)</span>
          </h4>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="rounded-lg bg-[#0a152b] p-3 border border-slate-800/80">
              <span className="font-bold text-amber-400">Step 1: Extract ZIP</span>
              <p className="mt-1 font-mono text-[11px] text-slate-400">unzip backup.zip -d portal</p>
            </div>
            <div className="rounded-lg bg-[#0a152b] p-3 border border-slate-800/80">
              <span className="font-bold text-amber-400">Step 2: Install</span>
              <p className="mt-1 font-mono text-[11px] text-slate-400">npm install</p>
            </div>
            <div className="rounded-lg bg-[#0a152b] p-3 border border-slate-800/80">
              <span className="font-bold text-amber-400">Step 3: Run</span>
              <p className="mt-1 font-mono text-[11px] text-slate-400">npm run build && npm start</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            The portal runs on any host with Node.js 18+ (Render, Railway, DigitalOcean, VPS, cPanel, or your local laptop). See the included <strong className="text-amber-300">STANDALONE_HOSTING_GUIDE.md</strong> inside the ZIP for full step-by-step instructions.
          </p>
        </div>
      </div>
    </div>
  );
};
