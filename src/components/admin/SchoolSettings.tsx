import React, { useState } from 'react';
import { Settings, Upload, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SchoolSettings as SchoolSettingsType } from '../../types';
import { saveAdminSettings, uploadSchoolLogo } from '../../lib/api';

interface SchoolSettingsProps {
  settings: SchoolSettingsType;
  onRefreshData: () => Promise<void>;
}

export const SchoolSettings: React.FC<SchoolSettingsProps> = ({
  settings,
  onRefreshData,
}) => {
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [established, setEstablished] = useState(settings.established);
  const [portalTitle, setPortalTitle] = useState(settings.portalTitle);
  const [motto, setMotto] = useState(settings.motto);
  const [teacherRemark, setTeacherRemark] = useState(settings.defaultRemarks.teacherRemark);
  const [principalRemark, setPrincipalRemark] = useState(settings.defaultRemarks.principalRemark);
  const [signedBy, setSignedBy] = useState(settings.defaultRemarks.signedBy);

  // Logo upload preview state
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Logo image exceeds 5MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewLogo(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyNewLogo = async () => {
    if (!previewLogo) return;
    setIsUploadingLogo(true);
    setErrorMessage(null);
    try {
      await uploadSchoolLogo(previewLogo);
      await onRefreshData();
      setPreviewLogo(null);
      setStatusMessage('Official school logo updated and saved permanently across all portals and result sheets.');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload new logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await saveAdminSettings({
        schoolName: schoolName.trim(),
        established: Number(established) || 2023,
        portalTitle: portalTitle.trim(),
        motto: motto.trim(),
        defaultRemarks: {
          teacherRemark: teacherRemark.trim(),
          principalRemark: principalRemark.trim(),
          signedBy: signedBy.trim(),
        },
      });
      await onRefreshData();
      setStatusMessage('School information and branding settings saved permanently.');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">RESULT / SCHOOL SETTINGS</h2>
          </div>
          <p className="text-xs text-slate-400">
            Manage school identity, active school logo, official motto, and default result remarks.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* School Branding & Logo Section */}
      <div className="rounded-2xl border border-amber-500/30 bg-[#0a152b] p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100">School Branding / Logo Customization</h3>
          <p className="text-xs text-slate-400">
            Upload a replacement logo from an Android gallery, phone files, or computer. The active logo updates on the navbar, results, and PIN cards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Active Logo Display */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase text-slate-400 mb-2">
              Active Official Logo
            </span>
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-amber-400/50 bg-[#060e1d] p-2 shadow-lg">
              <img
                src={settings.logoUrl || '/logo.png'}
                alt="Active Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <span className="mt-2 text-[10px] font-semibold text-emerald-400">
              Active on all documents
            </span>
          </div>

          {/* New Logo Preview if selected */}
          {previewLogo && (
            <div className="flex flex-col items-center border-l border-slate-800 sm:pl-6">
              <span className="text-[11px] font-bold uppercase text-amber-300 mb-2">
                New Logo Preview
              </span>
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-amber-400 bg-[#060e1d] p-2 shadow-lg">
                <img
                  src={previewLogo}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleApplyNewLogo}
                  disabled={isUploadingLogo}
                  className="rounded-lg border border-amber-400 bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {isUploadingLogo ? 'Saving...' : 'Set as Active Logo'}
                </button>
                <button
                  onClick={() => setPreviewLogo(null)}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Upload Action */}
          <div className="flex-1 flex flex-col justify-center sm:pl-4">
            <label className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-[#060e1d] p-6 text-center hover:border-amber-400/60 cursor-pointer transition">
              <Upload className="h-5 w-5 text-amber-400" />
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-200">
                  Select new school crest or logo file
                </span>
                <span className="block text-[10px] text-slate-500">
                  PNG, JPG, or WEBP (Max 5MB) from phone or PC
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
              />
            </label>
          </div>
        </div>
      </div>

      {/* School Information Form */}
      <form onSubmit={handleSubmitSettings} className="rounded-2xl border border-slate-800 bg-[#0a152b] p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100">School Identity & Official Motto</h3>
          <p className="text-xs text-slate-400">
            Edit the school motto ("Learning is fun" by default), school name, and academic defaults.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-slate-300">
              School Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 text-xs font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300">
              Established Year
            </label>
            <input
              type="number"
              value={established}
              onChange={(e) => setEstablished(parseInt(e.target.value, 10) || 2023)}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 font-mono text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-300">
              Portal Title
            </label>
            <input
              type="text"
              value={portalTitle}
              onChange={(e) => setPortalTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* School Motto (Editable requirement) */}
          <div>
            <label className="block font-semibold uppercase text-slate-300">
              School Motto <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="Learning is fun"
              className="mt-1.5 w-full rounded-xl border border-amber-500/40 bg-[#060e1d] px-3.5 py-2.5 font-serif italic text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
              required
            />
            <span className="text-[10px] text-slate-400">
              Default is "Learning is fun". Displayed on website and printed certificates.
            </span>
          </div>
        </div>

        {/* Default Remarks */}
        <div className="pt-2 border-t border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Default Remarks & Signatures for New Results
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-400">
                Default Teacher's Remark
              </label>
              <textarea
                rows={2}
                value={teacherRemark}
                onChange={(e) => setTeacherRemark(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] p-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-400">
                Default Principal / Head Teacher's Remark
              </label>
              <textarea
                rows={2}
                value={principalRemark}
                onChange={(e) => setPrincipalRemark(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] p-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase text-slate-400">
                Default Signatory Name
              </label>
              <input
                type="text"
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                className="mt-1 w-full max-w-md rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 flex justify-end border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl border border-amber-400 bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? 'Saving Changes...' : 'Save School Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
