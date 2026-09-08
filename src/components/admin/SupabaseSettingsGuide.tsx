import React from 'react';
import { Database, ShieldCheck, CheckCircle, Server, KeyRound, ExternalLink, HardDrive } from 'lucide-react';

export const SupabaseSettingsGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">SETTINGS / SUPABASE GUIDE</h2>
          </div>
          <p className="text-xs text-slate-400">
            Persistent database architecture, backend storage verification, and connection status.
          </p>
        </div>
      </div>

      {/* Active Persistence Box */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#07241a] to-[#0a152b] p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400 border border-emerald-500/40">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-emerald-300">
              Active Persistent Backend Storage Engine
            </h3>
            <p className="text-xs text-slate-300">
              Atomic disk-persisted database running with durable file and JSON synchronization.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="rounded-xl border border-slate-800 bg-[#060e1d] p-3">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Storage Engine</span>
            <span className="font-mono text-emerald-400 font-bold">Node Atomic Engine</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#060e1d] p-3">
            <span className="block text-[10px] font-bold uppercase text-slate-400">State Persistence</span>
            <span className="font-semibold text-slate-200">Survives restart & refresh</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#060e1d] p-3">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Public Access</span>
            <span className="font-semibold text-amber-300">Strict One-Time PIN enforced</span>
          </div>
        </div>
      </div>

      {/* Supabase Integration Specs */}
      <div className="rounded-2xl border border-slate-800 bg-[#0a152b] p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Server className="h-4 w-4 text-amber-400" />
          <span>Supabase Table Schemas & Architecture Reference</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The application is configured to maintain strict schema parity with relational database tables. All deletions, edits, PIN assignments, and status transitions are transactional.
        </p>

        <div className="space-y-3 font-mono text-xs">
          <div className="rounded-xl border border-slate-800 bg-[#060e1d] p-3 text-slate-300">
            <strong className="text-amber-300 font-sans">Students Table:</strong> id (UUID), student_number (UNIQUE), full_name, class_name, gender, guardian_contact, created_at
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#060e1d] p-3 text-slate-300">
            <strong className="text-amber-300 font-sans">Results Table:</strong> id (UUID), student_id, student_number, class_name, session, term, pin, subjects (JSONB), total_score, average_score, overall_grade, teacher_remark, principal_remark, signed_by, is_published, created_at
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#060e1d] p-3 text-slate-300">
            <strong className="text-amber-300 font-sans">Pins Table:</strong> id (UUID), pin (UNIQUE), student_id, result_id, session, term, status (UNUSED | USED), used_at, created_at
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#060e1d] p-3 text-slate-300">
            <strong className="text-amber-300 font-sans">Settings Table:</strong> school_name, established, motto, portal_title, logo_url, active_background_id, max_scores (JSONB), default_remarks (JSONB)
          </div>
        </div>
      </div>
    </div>
  );
};
