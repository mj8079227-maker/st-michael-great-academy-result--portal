import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemDescription?: string;
  warningMessage?: string;
  isDeleting?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Delete Confirmation',
  itemDescription,
  warningMessage = 'This will permanently remove the record from the database. It cannot be recovered.',
  isDeleting = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    await onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
      onClick={handleCancelClick}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-red-500/50 bg-[#0a152b] p-6 shadow-2xl shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-red-500/15 p-2 text-red-400 border border-red-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-200">{title}</h3>
              <p className="text-[11px] text-slate-400">Irreversible action</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isDeleting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-2 text-center sm:text-left">
          <p className="text-sm font-semibold text-slate-100">
            Are you sure you want to permanently delete this item?
          </p>
          {itemDescription && (
            <p className="rounded-xl border border-slate-800 bg-[#060e1d] p-2.5 font-mono text-xs text-amber-300 break-words">
              {itemDescription}
            </p>
          )}
          <p className="text-[11px] text-slate-400">
            {warningMessage}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isDeleting}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500 bg-red-600 px-5 py-2 text-xs font-black text-white hover:bg-red-500 active:scale-95 shadow-md shadow-red-950/60 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isDeleting ? 'DELETING...' : 'DELETE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
