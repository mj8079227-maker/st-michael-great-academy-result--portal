import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { Student } from '../../types';
import { saveStudent, deleteStudent } from '../../lib/api';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface StudentManagementProps {
  students: Student[];
  onRefreshData: () => Promise<void>;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [className, setClassName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [guardianContact, setGuardianContact] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate next student number: SMA-0001, SMA-0002, etc.
  const nextStudentNumber = useMemo(() => {
    let maxNum = 0;
    students.forEach((s) => {
      const match = s.studentNumber.match(/SMA-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const next = maxNum + 1;
    return `SMA-${next.toString().padStart(4, '0')}`;
  }, [students]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFullName('');
    setStudentNumber(nextStudentNumber);
    setClassName('JSS 1');
    setGender('Male');
    setGuardianContact('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFullName(student.fullName);
    setStudentNumber(student.studentNumber);
    setClassName(student.className);
    setGender(student.gender);
    setGuardianContact(student.guardianContact || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !studentNumber.trim() || !className.trim()) {
      setError('Full Name, Student Number, and Class are required.');
      return;
    }

    // Check for duplicate student number
    const duplicate = students.find(
      (s) =>
        s.studentNumber.trim().toUpperCase() === studentNumber.trim().toUpperCase() &&
        s.id !== editingStudent?.id
    );
    if (duplicate) {
      setError(`Student number "${studentNumber}" is already in use by ${duplicate.fullName}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await saveStudent({
        id: editingStudent?.id,
        fullName: fullName.trim(),
        studentNumber: studentNumber.trim().toUpperCase(),
        className: className.trim(),
        gender,
        guardianContact: guardianContact.trim(),
      });
      await onRefreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      await onRefreshData();
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete student.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(query) ||
        s.studentNumber.toLowerCase().includes(query) ||
        s.className.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">STUDENT MANAGEMENT</h2>
          </div>
          <p className="text-xs text-slate-400">
            Register students, manage academic numbers, and view student directory.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/60 bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0a152b] p-3">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student full name, student number (e.g. SMA-0001), or class..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Student List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a152b] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#071124] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Student Number</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, index) => (
                  <tr key={s.id} className="hover:bg-[#0e1d3d]/50 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-black text-amber-300">
                      {s.studentNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">{s.fullName}</td>
                    <td className="py-3 px-4">{s.className}</td>
                    <td className="py-3 px-4">{s.gender}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {s.guardianContact || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                          title="Edit Student"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    {searchQuery
                      ? 'No students found matching your search query.'
                      : 'No students registered yet. Click "Register New Student" above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-[#0a152b] p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-amber-300">
                {editingStudent ? 'Edit Student Record' : 'Register New Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Chukwuemeka David Emmanuel"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Student Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="SMA-0001"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 font-mono text-xs text-amber-300 focus:border-amber-400 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Auto-generated or custom</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Class <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. JSS 1, SS 2 Science"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Guardian Phone / Contact
                  </label>
                  <input
                    type="text"
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl border border-amber-400 bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Permanently Delete Student"
        itemDescription={
          deleteTarget
            ? `${deleteTarget.fullName} (${deleteTarget.studentNumber} - ${deleteTarget.className})`
            : ''
        }
        warningMessage="This will permanently delete this student record and all associated results and PINs from the database. This action cannot be undone."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
