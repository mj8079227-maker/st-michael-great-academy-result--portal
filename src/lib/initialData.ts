import { GradeScale, ResultBackground, SchoolSettings, AcademicSession } from '../types';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'ST. MICHAEL GREAT ACADEMY',
  established: 2023,
  portalTitle: 'OFFICIAL RESULT PORTAL',
  motto: 'Learning is fun',
  logoUrl: '/logo.png',
  activeBackgroundId: 'bg-classic-parchment',
  pinLength: 5,
  customPinLength: 5,
  maxScores: {
    ca1: 20,
    ca2: 20,
    exam: 60,
  },
  defaultRemarks: {
    teacherRemark: 'Demonstrated commendable dedication, disciplined study habits, and consistent academic progress.',
    principalRemark: 'An exceptional performance. Promoted with pride to the next academic level.',
    signedBy: 'Mrs Mary',
  },
  currentSession: '2026/2027',
  currentTerm: 'First Term',
};

export const DEFAULT_GRADE_SCALES: GradeScale[] = [
  { id: 'gr-1', gradeLetter: 'A', minScore: 75, maxScore: 100, remark: 'Distinction' },
  { id: 'gr-2', gradeLetter: 'B', minScore: 65, maxScore: 74, remark: 'Very Good' },
  { id: 'gr-3', gradeLetter: 'C', minScore: 50, maxScore: 64, remark: 'Credit' },
  { id: 'gr-4', gradeLetter: 'D', minScore: 45, maxScore: 49, remark: 'Pass' },
  { id: 'gr-5', gradeLetter: 'E', minScore: 40, maxScore: 44, remark: 'Fair' },
  { id: 'gr-6', gradeLetter: 'F', minScore: 0, maxScore: 39, remark: 'Fail' },
];

export const INITIAL_ACADEMIC_SESSIONS: AcademicSession[] = [
  { id: 'sess-1', session: '2026/2027', isCurrent: true },
  { id: 'sess-2', session: '2027/2028', isCurrent: false },
  { id: 'sess-3', session: '2028/2029', isCurrent: false },
  { id: 'sess-4', session: '2029/2030', isCurrent: false },
  { id: 'sess-5', session: '2030/2031', isCurrent: false },
  { id: 'sess-6', session: '2031/2032', isCurrent: false },
];

export const AVAILABLE_TERMS = ['First Term', 'Second Term', 'Third Term'] as const;

export const BUILTIN_RESULT_BACKGROUNDS: ResultBackground[] = [
  {
    id: 'bg-classic-parchment',
    name: 'Classic Academic Parchment',
    type: 'builtin',
    themeStyle: 'parchment',
    isProtected: true,
  },
  {
    id: 'bg-royal-navy',
    name: 'Royal Navy & 24K Gold',
    type: 'builtin',
    themeStyle: 'royal-navy',
    isProtected: true,
  },
  {
    id: 'bg-ivory-crest',
    name: 'Ivory Crest Watermark',
    type: 'builtin',
    themeStyle: 'ivory-crest',
    isProtected: true,
  },
  {
    id: 'bg-golden-academic',
    name: 'Golden Guilloche Security',
    type: 'builtin',
    themeStyle: 'golden-academic',
    isProtected: true,
  },
  {
    id: 'bg-vintage-diploma',
    name: 'Vintage Master Diploma',
    type: 'builtin',
    themeStyle: 'vintage-diploma',
    isProtected: true,
  },
  {
    id: 'bg-renaissance-scroll',
    name: 'Renaissance Heraldic Scroll',
    type: 'builtin',
    themeStyle: 'renaissance-scroll',
    isProtected: true,
  },
  {
    id: 'bg-modern-minimalist',
    name: 'Modern Academic Minimalist',
    type: 'builtin',
    themeStyle: 'modern-minimalist',
    isProtected: true,
  },
  {
    id: 'bg-regal-damask',
    name: 'Regal Gold Damask Weave',
    type: 'builtin',
    themeStyle: 'regal-damask',
    isProtected: true,
  },
  {
    id: 'bg-emerald-academic',
    name: 'Teal & Gold Laureate',
    type: 'builtin',
    themeStyle: 'emerald-academic',
    isProtected: true,
  },
  {
    id: 'bg-celestial-stars',
    name: 'Academy Constellation Stars',
    type: 'builtin',
    themeStyle: 'celestial-stars',
    isProtected: true,
  },
  {
    id: 'bg-classic-monogram',
    name: 'Security Microline Monogram',
    type: 'builtin',
    themeStyle: 'classic-monogram',
    isProtected: true,
  },
  {
    id: 'bg-honors-ribbon',
    name: 'Presidential Honors Ribbon',
    type: 'builtin',
    themeStyle: 'honors-ribbon',
    isProtected: true,
  },
];

export function calculateGrade(
  totalScore: number,
  scales: GradeScale[]
): { grade: string; remark: string } {
  for (const scale of scales) {
    if (totalScore >= scale.minScore && totalScore <= scale.maxScore) {
      return { grade: scale.gradeLetter, remark: scale.remark };
    }
  }
  return { grade: 'F', remark: 'Fail' };
}
