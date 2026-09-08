import React from 'react';
import { Users, FileSpreadsheet, KeyRound, CheckCircle, Plus, ArrowRight, Activity, Calendar } from 'lucide-react';
import { Student, StudentResult, PinRecord, SchoolSettings } from '../../types';
import { AdminSection } from './AdminLayout';

interface AdminDashboardProps {
  students: Student[];
  results: StudentResult[];
  pins: PinRecord[];
  settings: SchoolSettings;
  onNavigate: (section: AdminSection) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  results,
  pins,
  settings,
  onNavigate,
}) => {
  const publishedResults = results.filter((r) => r.isPublished);
  const unusedPins = pins.filter((p) => p.status === 'UNUSED');
  const usedPins = pins.filter((p) => p.status === 'USED');

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#0d1d3d] via-[#0b1730] to-[#081226] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Administrative Control Center
            </span>
            <h2 className="mt-1 font-['Cinzel',serif] text-xl sm:text-2xl font-black text-slate-100">
              {settings.schoolName}
            </h2>
            <p className="mt-0.5 text-xs text-slate-300">
              Active Session: <strong className="text-amber-300">{settings.currentSession}</strong> • Current Term: <strong className="text-amber-300">{settings.currentTerm}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/60 bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Student</span>
            </button>
            <button
              onClick={() => onNavigate('results')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#0f2142] px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-[#152e5c] active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>Add Result</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="cursor-pointer rounded-2xl border border-slate-800 bg-[#0a152b] p-5 shadow-lg transition hover:border-amber-500/40 hover:bg-[#0e1d3d]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Students</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400 border border-blue-500/30">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-slate-100">
            {students.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Registered academic profiles</p>
        </div>

        {/* Published Results */}
        <div
          onClick={() => onNavigate('results')}
          className="cursor-pointer rounded-2xl border border-slate-800 bg-[#0a152b] p-5 shadow-lg transition hover:border-amber-500/40 hover:bg-[#0e1d3d]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Published Results</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-emerald-400">
            {publishedResults.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Live for student verification</p>
        </div>

        {/* Unused PINs */}
        <div
          onClick={() => onNavigate('pins')}
          className="cursor-pointer rounded-2xl border border-slate-800 bg-[#0a152b] p-5 shadow-lg transition hover:border-amber-500/40 hover:bg-[#0e1d3d]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Unused PINs</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/30">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-amber-400">
            {unusedPins.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Ready for student verification</p>
        </div>

        {/* Used PINs */}
        <div
          onClick={() => onNavigate('pins')}
          className="cursor-pointer rounded-2xl border border-slate-800 bg-[#0a152b] p-5 shadow-lg transition hover:border-amber-500/40 hover:bg-[#0e1d3d]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Used PINs</span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/30">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-black text-purple-300">
            {usedPins.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Locked / checked by students</p>
        </div>
      </div>

      {/* Two-Column Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a152b] p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Recent Student Results</h3>
            </div>
            <button
              onClick={() => onNavigate('results')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {results.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No results created yet. Click "Add Result" to create your first student result sheet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {results.slice(0, 5).map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#081124] p-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{res.studentFullName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {res.studentNumber} • {res.className}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        res.isPublished
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {res.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-400 mt-0.5">
                      Avg: {res.averageScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent PIN Allocations */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a152b] p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Result PIN Statuses</h3>
            </div>
            <button
              onClick={() => onNavigate('pins')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              <span>Manage PINs</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {pins.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No PINs generated yet. Creating a result automatically assigns a unique numeric PIN.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pins.slice(0, 5).map((pin) => (
                <div
                  key={pin.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#081124] p-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{pin.studentFullName}</span>
                    <span className="text-[11px] text-slate-400">
                      Session: {pin.academicSession} ({pin.term})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold tracking-wider text-amber-300">
                      {pin.pin}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        pin.status === 'UNUSED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {pin.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
