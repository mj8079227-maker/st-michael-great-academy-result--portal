import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Printer,
  KeyRound,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  Student,
  StudentResult,
  ResultSubject,
  SchoolSettings,
  GradeScale,
  AcademicSession,
  PinRecord,
} from '../../types';
import { saveResult, deleteResult, togglePublishResult, generateUniquePin } from '../../lib/api';
import { calculateGrade } from '../../lib/initialData';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface ResultManagementProps {
  results: StudentResult[];
  students: Student[];
  pins: PinRecord[];
  settings: SchoolSettings;
  gradeScales: GradeScale[];
  sessions: AcademicSession[];
  onRefreshData: () => Promise<void>;
  onViewResult: (result: StudentResult) => void;
  onOpenPinCard: (pinRecord: PinRecord) => void;
}

const DEFAULT_SUBJECT_NAMES = [
  'English Language',
  'Mathematics',
  'Basic Science & Technology',
  'Social Studies',
  'Civic Education',
  'Agricultural Science',
  'Computer Studies / ICT',
  'Business Studies',
  'Christian Religious Studies',
  'Physical & Health Education',
];

export const ResultManagement: React.FC<ResultManagementProps> = ({
  results,
  students,
  pins,
  settings,
  gradeScales,
  sessions,
  onRefreshData,
  onViewResult,
  onOpenPinCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<StudentResult | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [className, setClassName] = useState('');
  const [academicSession, setAcademicSession] = useState(settings.currentSession);
  const [term, setTerm] = useState(settings.currentTerm);
  const [isPublished, setIsPublished] = useState(true);
  const [teacherRemark, setTeacherRemark] = useState('');
  const [principalRemark, setPrincipalRemark] = useState('');
  const [signedBy, setSignedBy] = useState('');
  const [assignedPin, setAssignedPin] = useState('');
  const [isGeneratingPin, setIsGeneratingPin] = useState(false);

  // Unlimited subjects array
  const [subjects, setSubjects] = useState<ResultSubject[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxCa1 = settings.maxScores.ca1;
  const maxCa2 = settings.maxScores.ca2;
  const maxExam = settings.maxScores.exam;
  const overallMaxPerSubject = maxCa1 + maxCa2 + maxExam;

  const handleGenerateNewPin = async () => {
    setIsGeneratingPin(true);
    try {
      const resp = await generateUniquePin();
      if (resp && resp.pin) {
        setAssignedPin(resp.pin);
      }
    } catch (err: any) {
      // Fallback unique numeric generator
      const fallback = Math.floor(10000 + Math.random() * 90000).toString();
      setAssignedPin(fallback);
    } finally {
      setIsGeneratingPin(false);
    }
  };

  const openCreateModal = () => {
    setEditingResult(null);
    setSelectedStudentId(students[0]?.id || '');
    setClassName(students[0]?.className || 'JSS 1');
    setAcademicSession(settings.currentSession);
    setTerm(settings.currentTerm);
    setIsPublished(true);
    setTeacherRemark(settings.defaultRemarks.teacherRemark);
    setPrincipalRemark(settings.defaultRemarks.principalRemark);
    setSignedBy(settings.defaultRemarks.signedBy || 'Rev. Fr. Michael / Administrator');

    // Auto-generate fresh unique PIN
    handleGenerateNewPin();

    // Populate initial subjects
    const initialSubs: ResultSubject[] = DEFAULT_SUBJECT_NAMES.map((name, i) => ({
      id: `subj-init-${i}-${Date.now()}`,
      subject: name,
      ca1: 15,
      ca2: 15,
      exam: 45,
      total: 75,
      grade: 'A',
      remark: 'Distinction',
    }));
    setSubjects(initialSubs);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (res: StudentResult) => {
    setEditingResult(res);
    setSelectedStudentId(res.studentId);
    setClassName(res.className);
    setAcademicSession(res.academicSession);
    setTerm(res.term);
    setIsPublished(res.isPublished);
    setTeacherRemark(res.teacherRemark);
    setPrincipalRemark(res.principalRemark);
    setSignedBy(res.signedBy || settings.defaultRemarks.signedBy);
    setAssignedPin(res.pin || '');
    setSubjects(JSON.parse(JSON.stringify(res.subjects || [])));
    setError(null);
    setIsModalOpen(true);
  };

  const handleStudentChange = (stdId: string) => {
    setSelectedStudentId(stdId);
    const found = students.find((s) => s.id === stdId);
    if (found) {
      setClassName(found.className);
    }
  };

  // Add subject row (Unlimited subjects requirement)
  const addSubjectRow = () => {
    const newRow: ResultSubject = {
      id: `subj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subject: '',
      ca1: 0,
      ca2: 0,
      exam: 0,
      total: 0,
      grade: 'F',
      remark: 'Fail',
    };
    setSubjects([...subjects, newRow]);
  };

  const removeSubjectRow = (index: number) => {
    const next = [...subjects];
    next.splice(index, 1);
    setSubjects(next);
  };

  const updateSubjectScore = (
    index: number,
    field: 'subject' | 'ca1' | 'ca2' | 'exam',
    value: string
  ) => {
    const next = [...subjects];
    const item = { ...next[index] };

    if (field === 'subject') {
      item.subject = value;
    } else {
      let num = parseFloat(value) || 0;
      if (num < 0) num = 0;

      if (field === 'ca1') item.ca1 = Math.min(num, maxCa1);
      if (field === 'ca2') item.ca2 = Math.min(num, maxCa2);
      if (field === 'exam') item.exam = Math.min(num, maxExam);

      item.total = item.ca1 + item.ca2 + item.exam;
      const { grade, remark } = calculateGrade(item.total, gradeScales);
      item.grade = grade;
      item.remark = remark;
    }

    next[index] = item;
    setSubjects(next);
  };

  // Compute live aggregates
  const liveTotalScore = subjects.reduce((sum, s) => sum + (s.total || 0), 0);
  const liveAverageScore = subjects.length > 0
    ? Number((liveTotalScore / subjects.length).toFixed(1))
    : 0;
  const liveOverallGrade = calculateGrade(liveAverageScore, gradeScales).grade;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }
    if (subjects.length === 0) {
      setError('Please add at least one subject to the result.');
      return;
    }
    if (subjects.some((s) => !s.subject.trim())) {
      setError('All subjects must have a subject name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveResult({
        id: editingResult?.id,
        studentId: selectedStudentId,
        className,
        academicSession,
        term,
        pin: assignedPin.trim(),
        isPublished,
        subjects,
        teacherRemark,
        principalRemark,
        signedBy,
      });
      await onRefreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save result.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteResult(deleteTarget.id);
      await onRefreshData();
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete result.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await togglePublishResult(id);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication status.');
    }
  };

  const filteredResults = useMemo(() => {
    let list = results;
    if (selectedSessionFilter !== 'ALL') {
      list = list.filter((r) => r.academicSession === selectedSessionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.studentFullName.toLowerCase().includes(q) ||
          r.studentNumber.toLowerCase().includes(q) ||
          r.className.toLowerCase().includes(q) ||
          r.pin.includes(q)
      );
    }
    return list;
  }, [results, searchQuery, selectedSessionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">RESULTS MANAGEMENT</h2>
          </div>
          <p className="text-xs text-slate-400">
            Create, publish, edit, and print official student term results.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/60 bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Result</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-800 bg-[#0a152b] p-3 w-full">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, student number, class, or PIN..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <select
            value={selectedSessionFilter}
            onChange={(e) => setSelectedSessionFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-800 bg-[#0a152b] px-3.5 py-3 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="ALL">All Academic Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.session}>
                {s.session}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a152b] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#071124] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Session & Term</th>
                <th className="py-3 px-4 text-center">Assigned PIN</th>
                <th className="py-3 px-4 text-center">Subjects</th>
                <th className="py-3 px-4 text-center">Average</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredResults.length > 0 ? (
                filteredResults.map((r, index) => {
                  const associatedPin = pins.find((p) => p.resultId === r.id);
                  return (
                    <tr key={r.id} className="hover:bg-[#0e1d3d]/50 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-100 block">{r.studentFullName}</span>
                        <span className="font-mono text-[11px] text-amber-300">
                          {r.studentNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">{r.className}</td>
                      <td className="py-3 px-4">
                        <span className="block font-medium text-slate-300">{r.academicSession}</span>
                        <span className="text-[11px] text-slate-400">{r.term}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-black text-amber-400 tracking-wider">
                          {r.pin}
                        </span>
                        {associatedPin && (
                          <span
                            className={`block text-[10px] font-bold ${
                              associatedPin.status === 'UNUSED'
                                ? 'text-amber-300'
                                : 'text-purple-300'
                            }`}
                          >
                            {associatedPin.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {r.subjects?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-slate-100">
                          {r.averageScore}%
                        </span>
                        <span className="block text-[10px] font-bold text-amber-300">
                          Grade {r.overallGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(r.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border transition ${
                            r.isPublished
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {r.isPublished ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewResult(r)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                            title="View / Print Official Result"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {associatedPin && (
                            <button
                              onClick={() => onOpenPinCard(associatedPin)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                              title="Print PIN Card"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(r)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                            title="Edit Result"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 cursor-pointer"
                            title="Delete Result"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    {searchQuery
                      ? 'No results found matching your search.'
                      : 'No results recorded yet. Click "Create New Result" above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT RESULT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="my-8 w-full max-w-4xl rounded-2xl border border-amber-500/40 bg-[#0a152b] p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-amber-300">
                  {editingResult ? 'Edit Student Result Sheet' : 'Create Student Result Sheet'}
                </h3>
                <p className="text-xs text-slate-400">
                  Enter continuous assessments (CA 1, CA 2) and Examination scores.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* Student and Session selection */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Student <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                    required
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.studentNumber} - {s.className})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Academic Session
                  </label>
                  <select
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.session}>
                        {s.session}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Term
                  </label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
              </div>

              {/* UNLIMITED SUBJECTS TABLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Subjects & Scores (Configured Max: CA1={maxCa1}, CA2={maxCa2}, Exam={maxExam})
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      {subjects.length} subjects
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addSubjectRow}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Subject Row</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#060e1d]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#081226] text-slate-400 font-bold uppercase">
                        <th className="py-2.5 px-3">Subject Name</th>
                        <th className="py-2.5 px-2 text-center w-24">CA 1 (Max {maxCa1})</th>
                        <th className="py-2.5 px-2 text-center w-24">CA 2 (Max {maxCa2})</th>
                        <th className="py-2.5 px-2 text-center w-24">Exam (Max {maxExam})</th>
                        <th className="py-2.5 px-2 text-center w-20">Total ({overallMaxPerSubject})</th>
                        <th className="py-2.5 px-2 text-center w-16">Grade</th>
                        <th className="py-2.5 px-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {subjects.map((sub, index) => (
                        <tr key={sub.id || index} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={sub.subject}
                              onChange={(e) => updateSubjectScore(index, 'subject', e.target.value)}
                              placeholder="e.g. Mathematics"
                              className="w-full rounded-lg border border-slate-700 bg-[#09152b] px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                              required
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={maxCa1}
                              step="any"
                              value={sub.ca1}
                              onChange={(e) => updateSubjectScore(index, 'ca1', e.target.value)}
                              className="w-full text-center rounded-lg border border-slate-700 bg-[#09152b] px-1 py-1.5 font-mono text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={maxCa2}
                              step="any"
                              value={sub.ca2}
                              onChange={(e) => updateSubjectScore(index, 'ca2', e.target.value)}
                              className="w-full text-center rounded-lg border border-slate-700 bg-[#09152b] px-1 py-1.5 font-mono text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={maxExam}
                              step="any"
                              value={sub.exam}
                              onChange={(e) => updateSubjectScore(index, 'exam', e.target.value)}
                              className="w-full text-center rounded-lg border border-slate-700 bg-[#09152b] px-1 py-1.5 font-mono text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-amber-300">
                            {sub.total}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="font-extrabold text-xs text-amber-200">
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeSubjectRow(index)}
                              className="rounded p-1 text-slate-500 hover:bg-red-950/40 hover:text-red-400"
                              title="Remove row"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Score Aggregate Pill */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                  <div className="flex items-center gap-4">
                    <span>
                      Total Score: <strong className="font-mono text-amber-300">{liveTotalScore}</strong>
                    </span>
                    <span>
                      Average Score: <strong className="font-mono text-amber-300">{liveAverageScore}%</strong>
                    </span>
                    <span>
                      Calculated Grade: <strong className="text-amber-400">{liveOverallGrade}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addSubjectRow}
                    className="text-xs font-semibold text-amber-300 hover:underline"
                  >
                    + Add Another Subject
                  </button>
                </div>
              </div>

              {/* RESULT PIN SECTION */}
              <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-[#0d1f42] to-[#0a1733] p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Result PIN
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Manually type the numeric PIN or tap generate to assign a unique confidential PIN.
                      </p>
                    </div>
                  </div>
                  {assignedPin && (
                    <span className="hidden sm:inline-block rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-300 border border-amber-500/30">
                      {assignedPin.length} Digits
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={assignedPin}
                      onChange={(e) => setAssignedPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter numeric PIN"
                      className="w-full rounded-xl border-2 border-amber-400/50 bg-[#060e1d] px-3.5 py-2.5 font-mono text-base font-black tracking-widest text-amber-300 placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                      maxLength={12}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateNewPin}
                    disabled={isGeneratingPin}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400 bg-amber-500 px-4 py-2.5 text-xs font-extrabold uppercase text-slate-950 hover:bg-amber-400 active:scale-95 disabled:opacity-50 cursor-pointer shadow whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isGeneratingPin ? 'Generating...' : 'Generate Unique PIN'}</span>
                  </button>
                </div>
              </div>

              {/* Remarks & Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Class Teacher's Remark
                  </label>
                  <textarea
                    rows={2}
                    value={teacherRemark}
                    onChange={(e) => setTeacherRemark(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] p-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Principal / Head Teacher's Remark
                  </label>
                  <textarea
                    rows={2}
                    value={principalRemark}
                    onChange={(e) => setPrincipalRemark(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] p-2.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Result Signed By
                  </label>
                  <input
                    type="text"
                    value={signedBy}
                    onChange={(e) => setSignedBy(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060e1d] px-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Publish Result (Available for public PIN checking immediately)</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
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
                  {isSubmitting ? 'Saving...' : editingResult ? 'Update Result' : 'Save & Publish Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Result Deletion Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Permanently Delete Result"
        itemDescription={
          deleteTarget
            ? `Result for ${deleteTarget.studentFullName} (${deleteTarget.studentNumber}) - ${deleteTarget.academicSession} ${deleteTarget.term} [PIN: ${deleteTarget.pin}]`
            : ''
        }
        warningMessage="This will permanently delete this student transcript and remove its assigned PIN from the database. The result will no longer be verifiable."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
