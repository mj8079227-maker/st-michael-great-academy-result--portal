import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { AcademicSession, SchoolSettings } from '../../types';
import { addAcademicSession, setCurrentSessionTerm } from '../../lib/api';

interface AcademicSessionSettingsProps {
  sessions: AcademicSession[];
  settings: SchoolSettings;
  onRefreshData: () => Promise<void>;
}

export const AcademicSessionSettings: React.FC<AcademicSessionSettingsProps> = ({
  sessions,
  settings,
  onRefreshData,
}) => {
  const [newSessionInput, setNewSessionInput] = useState('');
  const [selectedSession, setSelectedSession] = useState(settings.currentSession);
  const [selectedTerm, setSelectedTerm] = useState(settings.currentTerm);

  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const formatted = newSessionInput.trim();
    if (!formatted) {
      setErrorMessage('Please enter an academic session format like 2032/2033.');
      return;
    }

    // Validation pattern
    if (!/^\d{4}\/\d{4}$/.test(formatted)) {
      setErrorMessage('Invalid session format. Please use YYYY/YYYY (e.g. 2032/2033).');
      return;
    }

    if (sessions.some((s) => s.session === formatted)) {
      setErrorMessage(`Academic session "${formatted}" already exists in the registry.`);
      return;
    }

    setIsAdding(true);
    try {
      await addAcademicSession(formatted);
      await onRefreshData();
      setNewSessionInput('');
      setStatusMessage(`Academic session "${formatted}" added successfully.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add academic session.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleApplyCurrent = async () => {
    setIsUpdating(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await setCurrentSessionTerm(selectedSession, selectedTerm);
      await onRefreshData();
      setStatusMessage(`Current active period set to ${selectedSession} (${selectedTerm}).`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update current session/term.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">ACADEMIC SESSION & TERM</h2>
          </div>
          <p className="text-xs text-slate-400">
            Configure active academic periods and register future academic calendars indefinitely.
          </p>
        </div>
      </div>

      {/* Current Active Session Box */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#0a1733] to-[#081226] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              Active Portal Calendar
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-slate-100">
                {settings.currentSession}
              </span>
              <span className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-200">
                {settings.currentTerm}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              New results and student certificates default to this session and term.
            </p>
          </div>

          {/* Quick switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Select Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.session}>
                    {s.session}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Select Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={handleApplyCurrent}
                disabled={
                  isUpdating ||
                  (selectedSession === settings.currentSession &&
                    selectedTerm === settings.currentTerm)
                }
                className="rounded-xl border border-amber-400 bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? 'Applying...' : 'Set as Current'}
              </button>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-200">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Add Future Academic Sessions Indefinitely */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a152b] p-6 shadow-lg">
        <div className="border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-100">Add Future Academic Session</h3>
          <p className="text-xs text-slate-400">
            Register future calendar years (e.g. 2032/2033, 2033/2034, 2034/2035) without limitations.
          </p>
        </div>

        <form onSubmit={handleAddSession} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={newSessionInput}
            onChange={(e) => setNewSessionInput(e.target.value)}
            placeholder="e.g. 2032/2033"
            className="w-full sm:w-64 rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 font-mono text-xs text-amber-300 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400 bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isAdding ? 'Adding Session...' : 'Add Academic Session'}</span>
          </button>
        </form>

        {/* Existing Sessions List */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Registered Academic Sessions Registry ({sessions.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {sessions.map((s) => {
              const isCurrent = s.session === settings.currentSession;
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-500/10 text-amber-200 shadow'
                      : 'border-slate-800 bg-[#060e1d] text-slate-300'
                  }`}
                >
                  <span className="font-mono font-bold">{s.session}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase text-amber-400">Current</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
