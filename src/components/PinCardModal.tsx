import React from 'react';
import { Printer, X, ShieldCheck, KeyRound } from 'lucide-react';
import { PinRecord, PublicSchoolConfig } from '../types';

interface PinCardModalProps {
  pinRecord: PinRecord | null;
  config: PublicSchoolConfig | null;
  onClose: () => void;
}

export const PinCardModal: React.FC<PinCardModalProps> = ({
  pinRecord,
  config,
  onClose,
}) => {
  if (!pinRecord) return null;

  const schoolName = config?.schoolName || 'ST. MICHAEL GREAT ACADEMY';
  const established = config?.established || 2023;
  const motto = config?.motto || 'Learning is fun';
  const logoUrl = config?.logoUrl || '/logo.png';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-[#0a152b] p-6 shadow-2xl text-slate-100 print:border-2 print:border-black print:bg-white print:text-black print:shadow-none print:max-w-none print:w-full">
        {/* Modal Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-sm text-amber-300">Official Result PIN Card</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>PRINT PIN CARD</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Card Body */}
        <div
          id="printable-pin-card"
          className="relative rounded-xl border-2 border-amber-600/60 bg-gradient-to-br from-[#0c1833] to-[#081124] p-6 shadow-inner print:border-2 print:border-slate-800 print:bg-white print:text-slate-900"
        >
          {/* Top Crest & School Name */}
          <div className="flex items-center gap-4 border-b border-amber-500/30 pb-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-amber-400/50 bg-white/90 p-1 shadow">
              <img
                src={logoUrl}
                alt="School Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <div>
              <h2 className="font-['Cinzel',serif] text-base font-black tracking-wide text-amber-300 print:text-slate-900 sm:text-lg">
                {schoolName}
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-200/90 print:text-slate-700">
                <span>Established {established}</span>
                <span>•</span>
                <span>OFFICIAL RESULT PIN</span>
              </div>
              <p className="text-xs italic text-amber-400/90 print:text-amber-800 font-serif">
                "{motto}"
              </p>
            </div>
          </div>

          {/* Student & Session Information */}
          <div className="my-5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-400 print:text-slate-600">
                Student Full Name:
              </span>
              <span className="font-extrabold text-slate-100 print:text-slate-900">
                {pinRecord.studentFullName}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-400 print:text-slate-600">
                Student Number:
              </span>
              <span className="font-mono font-bold text-amber-300 print:text-slate-900">
                {pinRecord.studentNumber}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-400 print:text-slate-600">
                Academic Session:
              </span>
              <span className="font-semibold text-slate-200 print:text-slate-800">
                {pinRecord.academicSession}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-400 print:text-slate-600">
                Term:
              </span>
              <span className="font-semibold text-slate-200 print:text-slate-800">
                {pinRecord.term}
              </span>
            </div>
          </div>

          {/* ASSIGNED RESULT PIN (Highlighted box) */}
          <div className="my-4 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-500/10 p-4 text-center print:border-slate-800 print:bg-slate-100">
            <span className="block text-[11px] font-extrabold uppercase tracking-widest text-amber-300 print:text-slate-700">
              Assigned Result PIN
            </span>
            <div className="mt-1 font-mono text-2xl sm:text-3xl font-black tracking-widest text-amber-400 print:text-black">
              {pinRecord.pin}
            </div>
            <span className="mt-1 inline-block rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 print:text-slate-700">
              Status: {pinRecord.status}
            </span>
          </div>

          {/* Security & Instruction Footer */}
          <div className="pt-2 text-center text-[10px] text-slate-400 print:text-slate-600 space-y-1">
            <p className="flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="h-3 w-3 text-amber-400" />
              <span>Use this PIN to access your student term transcript at the official portal.</span>
            </p>
            <p className="italic text-amber-300/70 print:text-slate-700 font-serif">
              School motto: {motto}
            </p>
          </div>
        </div>

        {/* Print Button at bottom for mobile convenience (hidden in print) */}
        <div className="mt-5 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400 bg-amber-500 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-950 hover:brightness-110 active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>PRINT PIN CARD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
