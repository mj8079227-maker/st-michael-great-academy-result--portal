import React, { useState } from 'react';
import { GraduationCap, Sliders, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { GradeScale, SchoolSettings } from '../../types';
import { saveGradeScales, saveAdminSettings } from '../../lib/api';

interface GradingSettingsProps {
  gradeScales: GradeScale[];
  settings: SchoolSettings;
  onRefreshData: () => Promise<void>;
}

export const GradingSettings: React.FC<GradingSettingsProps> = ({
  gradeScales: initialScales,
  settings,
  onRefreshData,
}) => {
  const [scales, setScales] = useState<GradeScale[]>(JSON.parse(JSON.stringify(initialScales)));
  const [ca1Max, setCa1Max] = useState<number>(settings.maxScores.ca1);
  const [ca2Max, setCa2Max] = useState<number>(settings.maxScores.ca2);
  const [examMax, setExamMax] = useState<number>(settings.maxScores.exam);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const overallMax = (Number(ca1Max) || 0) + (Number(ca2Max) || 0) + (Number(examMax) || 0);

  const handleScaleChange = (
    index: number,
    field: keyof GradeScale,
    value: string | number
  ) => {
    const next = [...scales];
    next[index] = { ...next[index], [field]: value };
    setScales(next);
  };

  const addScaleRow = () => {
    const newScale: GradeScale = {
      id: `scale-${Date.now()}`,
      gradeLetter: 'New',
      minScore: 0,
      maxScore: 10,
      remark: 'Satisfactory',
    };
    setScales([...scales, newScale]);
  };

  const removeScaleRow = (index: number) => {
    if (scales.length <= 1) return;
    const next = [...scales];
    next.splice(index, 1);
    setScales(next);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    // Validation
    if (ca1Max < 1 || ca2Max < 1 || examMax < 1) {
      setErrorMessage('Assessment and examination maximums must be greater than zero.');
      setIsSaving(false);
      return;
    }

    try {
      // 1. Save grade scales
      await saveGradeScales(scales);
      // 2. Save max score distribution
      await saveAdminSettings({
        maxScores: {
          ca1: Number(ca1Max),
          ca2: Number(ca2Max),
          exam: Number(examMax),
        },
      });
      await onRefreshData();
      setStatusMessage('Grading scale and score maximums saved successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update grading settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">GRADING & ASSESSMENT SETTINGS</h2>
          </div>
          <p className="text-xs text-slate-400">
            Define continuous assessment maximums and custom letter grade thresholds.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Score Component Maximums */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#0a152b] p-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Sliders className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Assessment Score Maximums</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-300">
                First CA/Test Maximum
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={ca1Max}
                onChange={(e) => setCa1Max(parseInt(e.target.value, 10) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 font-mono text-sm font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500">Default: 20</span>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-300">
                Second CA/Test Maximum
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={ca2Max}
                onChange={(e) => setCa2Max(parseInt(e.target.value, 10) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 font-mono text-sm font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500">Default: 20</span>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-300">
                Examination Maximum
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={examMax}
                onChange={(e) => setExamMax(parseInt(e.target.value, 10) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 font-mono text-sm font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500">Default: 60</span>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex flex-col justify-center text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                Calculated Overall Maximum
              </span>
              <span className="mt-1 font-mono text-2xl font-black text-amber-400">
                {overallMax}
              </span>
              <span className="text-[10px] text-slate-400">Sum of CA1 + CA2 + Exam</span>
            </div>
          </div>
        </div>

        {/* Grade Scale Table */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a152b] p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-100">Grade Letter Thresholds & Remarks</h3>
            <button
              type="button"
              onClick={addScaleRow}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Grade Level</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-3 w-28">Grade Letter</th>
                  <th className="py-2.5 px-3 w-32">Min Score</th>
                  <th className="py-2.5 px-3 w-32">Max Score</th>
                  <th className="py-2.5 px-3">Grade Remark / Description</th>
                  <th className="py-2.5 px-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scales.map((s, index) => (
                  <tr key={s.id || index} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={s.gradeLetter}
                        onChange={(e) => handleScaleChange(index, 'gradeLetter', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-[#060e1d] px-2.5 py-1.5 font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={s.minScore}
                        onChange={(e) =>
                          handleScaleChange(index, 'minScore', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-[#060e1d] px-2.5 py-1.5 font-mono text-slate-200 focus:border-amber-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={s.maxScore}
                        onChange={(e) =>
                          handleScaleChange(index, 'maxScore', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-[#060e1d] px-2.5 py-1.5 font-mono text-slate-200 focus:border-amber-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={s.remark}
                        onChange={(e) => handleScaleChange(index, 'remark', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-[#060e1d] px-2.5 py-1.5 text-slate-200 focus:border-amber-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeScaleRow(index)}
                        disabled={scales.length <= 1}
                        className="rounded p-1 text-slate-500 hover:bg-red-950/40 hover:text-red-400 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Notices */}
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {statusMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-200">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl border border-amber-400 bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? 'Saving Changes...' : 'Save Grading Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
