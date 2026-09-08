import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Check, Trash2, Eye, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ResultBackground } from '../../types';
import { uploadResultBackground, deleteResultBackground, setActiveResultBackground } from '../../lib/api';
import { getBackgroundClassOrStyle } from '../../lib/backgroundStyles';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface ResultBackgroundSettingsProps {
  backgrounds: ResultBackground[];
  onRefreshData: () => Promise<void>;
}

export const ResultBackgroundSettings: React.FC<ResultBackgroundSettingsProps> = ({
  backgrounds,
  onRefreshData,
}) => {
  const [previewBg, setPreviewBg] = useState<ResultBackground | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState<ResultBackground | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const dataUrl = reader.result as string;
        await uploadResultBackground(file.name.replace(/\.[^/.]+$/, ''), dataUrl);
        await onRefreshData();
        setSuccessMessage('Custom result background uploaded successfully.');
        setTimeout(() => setSuccessMessage(null), 4000);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload custom background.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetActive = async (id: string) => {
    try {
      await setActiveResultBackground(id);
      await onRefreshData();
      setSuccessMessage('Active result background updated.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to activate background.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteResultBackground(deleteTarget.id);
      await onRefreshData();
      setDeleteTarget(null);
      setSuccessMessage('Custom background deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete background.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">RESULT BACKGROUND TEMPLATES</h2>
          </div>
          <p className="text-xs text-slate-400">
            Choose the official certificate background styling or upload a custom school watermark.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <label className="inline-flex items-center gap-2 rounded-xl border border-amber-400/60 bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer shadow">
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload Custom Background'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Backgrounds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {backgrounds.map((bg) => {
          const styleConfig = getBackgroundClassOrStyle(bg);
          const isCurrentActive = bg.isActive;

          return (
            <div
              key={bg.id}
              className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 transition ${
                isCurrentActive
                  ? 'border-amber-400 shadow-lg shadow-amber-500/20 bg-[#0c1833]'
                  : 'border-slate-800 bg-[#0a152b] hover:border-slate-700'
              }`}
            >
              {/* Mini Preview Box */}
              <div
                className={`h-36 p-3 flex flex-col justify-between border-b border-slate-800/80 ${styleConfig.className}`}
                style={styleConfig.style}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-amber-200 backdrop-blur-xs">
                    {bg.type === 'built-in' ? 'Built-in' : 'Custom'}
                  </span>
                  {isCurrentActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow">
                      <Check className="h-3 w-3" />
                      <span>ACTIVE</span>
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-[11px] font-['Cinzel',serif] font-bold truncate">
                    ST. MICHAEL GREAT ACADEMY
                  </div>
                  <div className="text-[9px] font-serif italic text-amber-700/80">
                    "Learning is fun"
                  </div>
                </div>

                <div className="text-right text-[9px] font-mono opacity-60">
                  Sample Certificate
                </div>
              </div>

              {/* Card Footer Info & Controls */}
              <div className="p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">{bg.name}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <button
                    onClick={() => setPreviewBg(bg)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-300"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {bg.type === 'uploaded' && !isCurrentActive && (
                      <button
                        onClick={() => setDeleteTarget(bg)}
                        className="rounded p-1 text-slate-500 hover:bg-red-950/40 hover:text-red-400 cursor-pointer"
                        title="Delete custom background"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {!isCurrentActive && (
                      <button
                        onClick={() => handleSetActive(bg.id)}
                        className="rounded-lg border border-amber-400/60 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Preview Modal */}
      {previewBg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-[#0a152b] p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-amber-300">
                Background Preview: {previewBg.name}
              </h3>
              <button
                onClick={() => setPreviewBg(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div
              className={`rounded-xl border-4 p-8 text-center space-y-4 ${getBackgroundClassOrStyle(previewBg).className}`}
              style={getBackgroundClassOrStyle(previewBg).style}
            >
              <h1 className="font-['Cinzel',serif] text-xl font-black">
                ST. MICHAEL GREAT ACADEMY
              </h1>
              <p className="text-xs font-serif italic">
                School motto: "Learning is fun" • Established 2023
              </p>
              <div className="py-4 border-y border-current/20 text-xs">
                Official Student Result Sheet & Academic Performance Document
              </div>
              <p className="text-[11px] opacity-75">
                This preview illustrates how student transcripts, tables, and seals will render on this background.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPreviewBg(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Close Preview
              </button>
              {!previewBg.isActive && (
                <button
                  onClick={() => {
                    handleSetActive(previewBg.id);
                    setPreviewBg(null);
                  }}
                  className="rounded-xl border border-amber-400 bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  Set as Active Background
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Background Deletion Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Custom Background"
        itemDescription={deleteTarget ? deleteTarget.name : ''}
        warningMessage="This will permanently delete this uploaded background template. Results using this background will revert to the default official theme."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
