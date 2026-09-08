import React from 'react';
import {
  Printer,
  ArrowLeft,
  Award,
  CheckCircle,
  ShieldCheck,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { StudentResult, PublicSchoolConfig, ResultBackground } from '../types';
import { getBackgroundClassOrStyle } from '../lib/backgroundStyles';

interface ResultDisplayProps {
  result: StudentResult;
  config: PublicSchoolConfig;
  background?: ResultBackground;
  onBack: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  config,
  background,
  onBack,
}) => {
  const schoolName = config.schoolName || 'ST. MICHAEL GREAT ACADEMY';
  const established = config.established || 2023;
  const portalTitle = config.portalTitle || 'OFFICIAL RESULT PORTAL';
  const motto = config.motto || 'Learning is fun';
  const logoUrl = config.logoUrl || '/logo.png';

  const handlePrint = () => {
    window.print();
  };

  const bgConfig = getBackgroundClassOrStyle(background || config.activeBackground);

  return (
    <div className="min-h-screen bg-[#070f1e] py-6 px-3 sm:px-6 lg:px-8">
      {/* Top Action Bar (Hidden during printing) */}
      <div className="mx-auto max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0d1c38] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-[#13284d] hover:text-amber-200 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Result Portal</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
            <CheckCircle className="h-4 w-4" />
            <span>Verified Official Transcript</span>
          </span>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>PRINT RESULT / SAVE AS PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Result Certificate Sheet */}
      <div
        id="printable-result"
        className={`relative mx-auto max-w-4xl rounded-2xl border-4 p-6 sm:p-10 transition-all ${bgConfig.className} print:border-2 print:p-8 print:shadow-none print:m-0 print:w-full print:max-w-none text-slate-900`}
        style={bgConfig.style}
      >
        {/* Subtle Watermark Logo in Center */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <img src={logoUrl} alt="Watermark" className="h-96 w-96 object-contain" />
        </div>

        {/* Certificate Header with Crest & School Branding */}
        <div className="relative border-b-2 border-amber-600/40 pb-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {/* School Crest Logo */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-white/95 p-1.5 shadow-md">
              <img
                src={logoUrl}
                alt="School Crest"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>

            {/* School Branding */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h1 className="font-['Cinzel',serif] text-2xl font-black tracking-wide text-slate-900 sm:text-3xl">
                {schoolName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-widest text-amber-900">
                <span>Established {established}</span>
                <span>•</span>
                <span className="text-slate-800">{portalTitle}</span>
              </div>
              <p className="mt-1 font-serif text-sm font-semibold italic text-amber-800">
                "{motto}"
              </p>
            </div>
          </div>

          <div className="mt-4 inline-block rounded-full border border-amber-700/30 bg-amber-600/10 px-5 py-1 text-xs font-extrabold uppercase tracking-widest text-amber-950">
            OFFICIAL STUDENT ACADEMIC TRANSCRIPT & REPORT SHEET
          </div>
        </div>

        {/* Student Information Grid */}
        <div className="my-6 rounded-xl border border-amber-600/30 bg-white/80 p-4 sm:p-5 backdrop-blur-xs shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-500">
                Student Full Name:
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {result.studentFullName}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-500">
                Student Reg. Number:
              </span>
              <span className="font-mono text-sm font-extrabold text-amber-900">
                {result.studentNumber}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-500">
                Class / Arm:
              </span>
              <span className="text-sm font-bold text-slate-900">
                {result.className}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-500">
                Academic Session:
              </span>
              <span className="text-sm font-bold text-slate-900">
                {result.academicSession}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-500">
                Academic Term:
              </span>
              <span className="text-sm font-bold text-slate-900">
                {result.term}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-500">
                Result Status:
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified & Published</span>
              </span>
            </div>
          </div>
        </div>

        {/* RESULT TABLE: Unlimited Subjects */}
        <div className="overflow-x-auto rounded-xl border border-amber-700/30 bg-white/90 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-amber-700/30 bg-amber-800/10 text-slate-900 font-extrabold">
                <th className="py-2.5 px-3 uppercase tracking-wider">#</th>
                <th className="py-2.5 px-3 uppercase tracking-wider">Subject</th>
                <th className="py-2.5 px-3 text-center uppercase tracking-wider">1st CA / Test</th>
                <th className="py-2.5 px-3 text-center uppercase tracking-wider">2nd CA / Test</th>
                <th className="py-2.5 px-3 text-center uppercase tracking-wider">Exam</th>
                <th className="py-2.5 px-3 text-center uppercase tracking-wider font-black">Total</th>
                <th className="py-2.5 px-3 text-center uppercase tracking-wider">Grade</th>
                <th className="py-2.5 px-3 uppercase tracking-wider hidden sm:table-cell">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-700/20 text-slate-800">
              {result.subjects && result.subjects.length > 0 ? (
                result.subjects.map((subj, index) => (
                  <tr key={subj.id || index} className="hover:bg-amber-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{index + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{subj.subject}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{subj.ca1}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{subj.ca2}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{subj.exam}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-black text-amber-950 bg-amber-500/10">
                      {subj.total}
                    </td>
                    <td className="py-2.5 px-3 text-center font-extrabold">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-black ${
                          subj.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-900'
                            : subj.grade === 'B'
                            ? 'bg-blue-100 text-blue-900'
                            : subj.grade === 'C'
                            ? 'bg-amber-100 text-amber-900'
                            : subj.grade === 'D' || subj.grade === 'E'
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-red-100 text-red-900'
                        }`}
                      >
                        {subj.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 italic text-slate-600 hidden sm:table-cell">
                      {subj.remark}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                    No subject records entered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Aggregate Summary Box */}
        <div className="mt-4 rounded-xl border border-amber-600/30 bg-amber-600/10 p-4">
          <div className="grid grid-cols-3 divide-x divide-amber-600/30 text-center text-xs">
            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-600">
                Total Score
              </span>
              <span className="font-mono text-lg font-black text-slate-900">
                {result.totalScore}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-600">
                Average Score
              </span>
              <span className="font-mono text-lg font-black text-amber-950">
                {result.averageScore.toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase text-slate-600">
                Overall Grade
              </span>
              <span className="text-lg font-black text-emerald-800">
                Grade {result.overallGrade}
              </span>
            </div>
          </div>
        </div>

        {/* Affective Domain & Skills Assessment */}
        <div className="mt-4 rounded-xl border border-amber-600/20 bg-white/70 p-3.5 text-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Behavioral Traits & Psychomotor Assessment:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="flex items-center justify-between border-b border-amber-700/10 pb-1">
              <span className="text-slate-600">Punctuality:</span>
              <span className="font-bold text-amber-900">★★★★★ (5/5)</span>
            </div>
            <div className="flex items-center justify-between border-b border-amber-700/10 pb-1">
              <span className="text-slate-600">Neatness:</span>
              <span className="font-bold text-amber-900">★★★★★ (5/5)</span>
            </div>
            <div className="flex items-center justify-between border-b border-amber-700/10 pb-1">
              <span className="text-slate-600">Politeness:</span>
              <span className="font-bold text-amber-900">★★★★★ (5/5)</span>
            </div>
            <div className="flex items-center justify-between border-b border-amber-700/10 pb-1">
              <span className="text-slate-600">Honesty:</span>
              <span className="font-bold text-amber-900">★★★★★ (5/5)</span>
            </div>
            <div className="flex items-center justify-between border-b border-amber-700/10 pb-1">
              <span className="text-slate-600">Attentiveness:</span>
              <span className="font-bold text-amber-900">★★★★☆ (4/5)</span>
            </div>
            <div className="flex items-center justify-between border-b border-amber-700/10 pb-1">
              <span className="text-slate-600">Leadership:</span>
              <span className="font-bold text-amber-900">★★★★☆ (4/5)</span>
            </div>
            <div className="flex items-center justify-between border-b border-amber-700/10 pb-1">
              <span className="text-slate-600">Sports & Games:</span>
              <span className="font-bold text-amber-900">★★★★★ (5/5)</span>
            </div>
            <div className="flex items-center justify-between border-b border-amber-700/10 pb-1">
              <span className="text-slate-600">Sense of Duty:</span>
              <span className="font-bold text-amber-900">★★★★★ (5/5)</span>
            </div>
          </div>
        </div>

        {/* Remarks & Signatures Section */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-amber-700/30 pt-4 text-xs">
          <div className="rounded-lg border border-amber-700/20 bg-white/70 p-3">
            <span className="block text-[10px] font-bold uppercase text-slate-500">
              Form Teacher's Remark:
            </span>
            <p className="mt-1 font-serif italic text-slate-800 leading-relaxed">
              "{result.teacherRemark || 'Demonstrated commendable academic attitude, discipline, and consistent effort throughout the term.'}"
            </p>
          </div>

          <div className="rounded-lg border border-amber-700/20 bg-white/70 p-3">
            <span className="block text-[10px] font-bold uppercase text-slate-500">
              Principal / Head Teacher's Remark:
            </span>
            <p className="mt-1 font-serif italic text-slate-800 leading-relaxed">
              "{result.principalRemark || 'An impressive and consistent performance. Keep up the high standard of academic excellence.'}"
            </p>
          </div>
        </div>

        {/* Footer: Official Stamp & Date */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-700/30 pt-4 text-xs text-slate-600">
          <div className="text-center sm:text-left">
            <span className="block text-[10px] uppercase text-slate-400">Authorized Signatory</span>
            <span className="font-bold text-slate-900">
              {config.signedBy || result.signedBy || 'Rev. Fr. Michael / Administrator'}
            </span>
            <span className="block text-[10px] text-amber-800 font-semibold">
              Principal & Director of Studies
            </span>
          </div>

          {/* Official Stamp Hologram Simulation */}
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-amber-700/60 p-1 text-center">
              <span className="text-[8px] font-black uppercase text-amber-800 leading-tight">
                OFFICIAL<br />SEAL<br />2023
              </span>
            </div>
            <span className="mt-1 text-[9px] text-slate-400">School Official Stamp</span>
          </div>

          <div className="text-center sm:text-right text-[11px]">
            <span className="block text-slate-400">Printed / Verified on:</span>
            <span className="font-mono font-semibold text-slate-800">
              {new Date().toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="block text-[10px] text-emerald-700 font-bold mt-0.5">
              ✓ Tamper-Evident Digital Record
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
