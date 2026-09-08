export interface SchoolSettings {
  schoolName: string;
  established: number;
  portalTitle: string;
  motto: string;
  logoUrl: string;
  activeBackgroundId: string;
  pinLength: number; // 5, 6, 7, 8, 9, 10, or custom
  customPinLength?: number;
  maxScores: {
    ca1: number;
    ca2: number;
    exam: number;
  };
  defaultRemarks: {
    teacherRemark: string;
    principalRemark: string;
    signedBy: string;
  };
  currentSession: string;
  currentTerm: string;
}

export interface Student {
  id: string;
  studentNumber: string; // e.g. SMA-0001
  fullName: string;
  className: string;
  gender: 'Male' | 'Female';
  guardianContact: string;
  createdAt: string;
}

export interface ResultSubject {
  id: string;
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentNumber: string;
  studentFullName: string;
  className: string;
  academicSession: string;
  term: string;
  pin: string;
  isPublished: boolean;
  subjects: ResultSubject[];
  totalScore: number;
  averageScore: number;
  overallGrade: string;
  teacherRemark: string;
  principalRemark: string;
  signedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type PinStatus = 'UNUSED' | 'USED';

export interface PinRecord {
  id: string;
  pin: string;
  studentId: string;
  studentNumber: string;
  studentFullName: string;
  resultId: string;
  academicSession: string;
  term: string;
  status: PinStatus;
  usedAt: string | null;
  createdAt: string;
}

export interface GradeScale {
  id: string;
  gradeLetter: string;
  minScore: number;
  maxScore: number;
  remark: string;
}

export interface ResultBackground {
  id: string;
  name: string;
  type: 'builtin' | 'uploaded';
  url?: string;
  themeStyle: string;
  isProtected?: boolean;
  isActive?: boolean;
}

export interface AcademicSession {
  id: string;
  session: string;
  isCurrent: boolean;
}

export interface ResultMonitoringLog {
  id: string;
  timestamp: string;
  studentFullName: string;
  studentNumber: string;
  academicSession: string;
  term: string;
  pin: string;
  pinEntered?: string;
  pinStatus: PinStatus;
  userAgent?: string;
  success: boolean;
  message: string;
}

export type ResultCheckLog = ResultMonitoringLog;

export interface PublicSchoolConfig {
  schoolName: string;
  established: number;
  portalTitle: string;
  motto: string;
  logoUrl: string;
  currentSession?: string;
  currentTerm?: string;
  signedBy?: string;
  activeBackground?: ResultBackground;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  result?: StudentResult;
  schoolSettings?: PublicSchoolConfig;
  background?: ResultBackground;
}
