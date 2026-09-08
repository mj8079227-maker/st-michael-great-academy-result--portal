import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Search,
  RotateCcw,
  Printer,
  Sliders,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { PinRecord, SchoolSettings } from '../../types';
import { resetPin, saveAdminSettings, updatePin, deletePin } from '../../lib/api';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface PinManagementProps {
  pins: PinRecord[];
  settings: SchoolSettings;
  onRefreshData: () => Promise<void>;
  onOpenPinCard: (pinRecord: PinRecord) => void;
}

export const PinManagement: React.FC<PinManagementProps> = ({
  pins,
  settings,
  onRefreshData,
  onOpenPinCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNUSED' | 'USED'>('ALL');
  const [pinLength, setPinLength] = useState<number>(settings.pinLength || 5);
  const [isSavingLength, setIsSavingLength] = useState(false);
  const [lengthSuccessMessage, setLengthSuccessMessage] = useState<string | null>(null);

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState<PinRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit PIN Modal State
  const [editingPinRecord, setEditingPinRecord] = useState<PinRecord | null>(null);
  const [editedPinValue, setEditedPinValue] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinEditError, setPinEditError] = useState<string | null>(null);

  const handleSavePinLength = async () => {
    setIsSavingLength(true);
    try {
      await saveAdminSettings({ pinLength });
      await onRefreshData();
      setLengthSuccessMessage(`PIN length set to ${pinLength} digits for all future generated PINs.`);
      setTimeout(() => setLengthSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update PIN length.');
    } finally {
      setIsSavingLength(false);
    }
  };

  const handleReusePin = async (pinId: string) => {
    try {
      await resetPin(pinId);
      await onRefreshData();
      setLengthSuccessMessage('PIN status reverted to UNUSED. Student can check result one more time with the same PIN.');
      setTimeout(() => setLengthSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reuse PIN.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePin(deleteTarget.id);
      await onRefreshData();
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete PIN.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (p: PinRecord) => {
    setEditingPinRecord(p);
    setEditedPinValue(p.pin);
    setPinEditError(null);
  };

  const handleSaveEditedPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPinRecord) return;
    const clean = editedPinValue.trim();
    if (!clean) {
      setPinEditError('PIN cannot be empty.');
      return;
    }
    if (!/^\d+$/.test(clean)) {
      setPinEditError('PIN must consist of numbers only.');
      return;
    }

    setIsSavingPin(true);
    try {
      await updatePin(editingPinRecord.id, clean);
      await onRefreshData();
      setEditingPinRecord(null);
    } catch (err: any) {
      setPinEditError(err.message || 'Failed to update PIN.');
    } finally {
      setIsSavingPin(false);
    }
  };

  const filteredPins = useMemo(() => {
    let list = pins;
    if (statusFilter !== 'ALL') {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.studentFullName.toLowerCase().includes(q) ||
          p.studentNumber.toLowerCase().includes(q) ||
          p.pin.includes(q) ||
          p.academicSession.toLowerCase().includes(q) ||
          p.term.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pins, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">PIN MANAGEMENT</h2>
          </div>
          <p className="text-xs text-slate-400">
            Audit one-time result PINs, reset used PINs for re-checking, and configure future PIN lengths.
          </p>
        </div>
      </div>

      {/* PIN Length Settings Box */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#0a1733] to-[#081226] p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Numeric PIN Length Configuration</h3>
              <p className="text-xs text-slate-300">
                Choose the digit length for all <strong>future generated PINs</strong> (e.g. 5, 6, 7, 8, 9, 10 digits).
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                * Existing active PINs will not be broken or altered.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={pinLength}
              onChange={(e) => setPinLength(parseInt(e.target.value, 10))}
              className="rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2 text-xs font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
            >
              {[4, 5, 6, 7, 8, 9, 10, 12].map((len) => (
                <option key={len} value={len}>
                  {len} Digits ({Math.pow(10, len - 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} combinations)
                </option>
              ))}
            </select>
            <button
              onClick={handleSavePinLength}
              disabled={isSavingLength || pinLength === settings.pinLength}
              className="rounded-xl border border-amber-400 bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
            >
              {isSavingLength ? 'Saving...' : 'Apply Setting'}
            </button>
          </div>
        </div>

        {lengthSuccessMessage && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{lengthSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-800 bg-[#0a152b] p-3 w-full">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, student number, PIN, or session..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0a152b] p-1.5 w-full sm:w-auto">
          {(['ALL', 'UNUSED', 'USED'] as const).map((filter) => (
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

      {/* PINs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a152b] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#071124] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Student Full Name</th>
                <th className="py-3 px-4">Student Number</th>
                <th className="py-3 px-4">Session & Term</th>
                <th className="py-3 px-4 text-center">Result PIN</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Used Date/Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredPins.length > 0 ? (
                filteredPins.map((p, index) => (
                  <tr key={p.id} className="hover:bg-[#0e1d3d]/50 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{p.studentFullName}</td>
                    <td className="py-3 px-4 font-mono text-amber-300">{p.studentNumber}</td>
                    <td className="py-3 px-4">
                      <span>{p.academicSession}</span>
                      <span className="block text-[11px] text-slate-400">{p.term}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-sm font-black tracking-widest text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                        {p.pin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-extrabold tracking-wider border ${
                          p.status === 'UNUSED'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                      {p.usedAt ? new Date(p.usedAt).toLocaleString() : '— Not used yet —'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Printable PIN Card shortcut */}
                        <button
                          onClick={() => onOpenPinCard(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer"
                          title="Print PIN Card"
                        >
                          <Printer className="h-3.5 w-3.5 text-amber-400" />
                          <span>Card</span>
                        </button>

                        {/* REUSE PIN Button (exact prompt requirement: keep SAME pin, change status USED -> UNUSED) */}
                        {p.status === 'USED' && (
                          <button
                            onClick={() => handleReusePin(p.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/60 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 active:scale-95 cursor-pointer"
                            title="Keep same PIN and return status to UNUSED"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>REUSE PIN</span>
                          </button>
                        )}

                        {/* Edit PIN button */}
                        <button
                          onClick={() => openEditModal(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300 cursor-pointer"
                          title="Edit PIN number"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete PIN button */}
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 cursor-pointer"
                          title="Delete PIN"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    {searchQuery
                      ? 'No PINs found matching your search.'
                      : 'No PINs recorded. Create a student result to generate an official PIN.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit PIN Modal */}
      {editingPinRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#081326] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Edit Result PIN</h3>
              </div>
              <button
                onClick={() => setEditingPinRecord(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPin} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-300">
                  Student: <strong className="text-amber-300">{editingPinRecord.studentFullName}</strong> ({editingPinRecord.studentNumber})
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {editingPinRecord.academicSession} — {editingPinRecord.term}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  PIN Number (Digits Only)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editedPinValue}
                  onChange={(e) => setEditedPinValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border-2 border-amber-500/50 bg-[#040b17] px-3.5 py-2.5 font-mono text-xl font-black tracking-widest text-amber-300 focus:border-amber-400 focus:outline-none"
                  maxLength={12}
                  autoFocus
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Changing this PIN will automatically update the student's result record.
                </p>
              </div>

              {pinEditError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{pinEditError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPinRecord(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPin}
                  className="rounded-xl border border-amber-400 bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
                >
                  {isSavingPin ? 'Saving...' : 'Save PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm PIN Deletion Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Permanently Delete PIN"
        itemDescription={
          deleteTarget
            ? `PIN: ${deleteTarget.pin} for ${deleteTarget.studentFullName} (${deleteTarget.studentNumber})`
            : ''
        }
        warningMessage="This will permanently delete this PIN record from the database. The student will not be able to check their result without an active PIN."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
