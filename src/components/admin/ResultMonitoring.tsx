import React, { useState, useMemo } from 'react';
import { Activity, Search, CheckCircle, XCircle, Clock, ShieldCheck, KeyRound } from 'lucide-react';
import { ResultCheckLog } from '../../types';

interface ResultMonitoringProps {
  logs: ResultCheckLog[];
  onRefreshData: () => Promise<void>;
}

export const ResultMonitoring: React.FC<ResultMonitoringProps> = ({ logs, onRefreshData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');

  const filteredLogs = useMemo(() => {
    let list = logs;
    if (statusFilter === 'SUCCESS') {
      list = list.filter((l) => l.success);
    } else if (statusFilter === 'FAILED') {
      list = list.filter((l) => !l.success);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.studentFullName.toLowerCase().includes(q) ||
          l.studentNumber.toLowerCase().includes(q) ||
          (l.pin || l.pinEntered || '').includes(q) ||
          l.academicSession.toLowerCase().includes(q) ||
          l.term.toLowerCase().includes(q) ||
          l.message.toLowerCase().includes(q)
      );
    }
    return list;
  }, [logs, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">RESULT MONITORING & AUDIT LOGS</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time tracking of PIN checks, access attempts, and verification activity.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-800 bg-[#0a152b] p-3 w-full">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by student name, number, PIN entered, or message..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0a152b] p-1.5 w-full sm:w-auto">
          {(['ALL', 'SUCCESS', 'FAILED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === filter
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a152b] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#071124] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Student Number</th>
                <th className="py-3 px-4">Session & Term</th>
                <th className="py-3 px-4 text-center">PIN Used</th>
                <th className="py-3 px-4 text-center">Result Status</th>
                <th className="py-3 px-4">System Message / Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0e1d3d]/50 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-amber-400/80" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">{log.studentFullName}</td>
                    <td className="py-3 px-4 font-mono text-amber-300">{log.studentNumber}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.academicSession} ({log.term})
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-amber-400">
                        {log.pin || log.pinEntered || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          log.success
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-red-500/40 bg-red-950/40 text-red-300'
                        }`}
                      >
                        {log.success ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>VERIFIED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>REJECTED</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {log.message}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    {searchQuery
                      ? 'No audit records matching your search.'
                      : 'No verification activities recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
