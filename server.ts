import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { appStore } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import {
  SchoolSettings,
  Student,
  StudentResult,
  PinRecord,
  GradeScale,
  ResultBackground,
  AcademicSession,
  ResultMonitoringLog,
  PublicSchoolConfig,
} from './src/types';
import {
  DEFAULT_SCHOOL_SETTINGS,
  DEFAULT_GRADE_SCALES,
  INITIAL_ACADEMIC_SESSIONS,
  BUILTIN_RESULT_BACKGROUNDS,
  calculateGrade,
} from './src/lib/initialData';

const app = express();
const PORT = 3000;

// Increase payload limit for logo and background image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure persistent directories exist
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve public uploads statically
app.use('/uploads', express.static(UPLOADS_DIR));

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Helper to hash passwords with SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

// Generate random numeric PIN of specified length
function generateNumericPin(length: number, existingPins: Set<string>): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  let attempts = 0;
  while (attempts < 1000) {
    const pin = Math.floor(min + Math.random() * (max - min + 1)).toString();
    if (!existingPins.has(pin)) {
      return pin;
    }
    attempts++;
  }
  // Fallback
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

interface DatabaseSchema {
  settings: SchoolSettings;
  students: Student[];
  results: StudentResult[];
  pins: PinRecord[];
  gradeScales: GradeScale[];
  sessions: AcademicSession[];
  backgrounds: ResultBackground[];
  monitoringLogs: ResultMonitoringLog[];
  adminPasswordHash: string;
}

// In-memory active tokens
const activeSessions = new Set<string>();

// Load database from durable disk
function loadDatabase(): DatabaseSchema {
  const starterStudents: Student[] = [
    {
      id: 'std-sma-0001',
      studentNumber: 'SMA-0001',
      fullName: 'Chukwuemeka David Emmanuel',
      className: 'JSS 1 Gold',
      gender: 'Male',
      guardianContact: '+234 803 123 4567',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'std-sma-0002',
      studentNumber: 'SMA-0002',
      fullName: 'Fatima Zahra Mohammed',
      className: 'JSS 2 Diamond',
      gender: 'Female',
      guardianContact: '+234 802 987 6543',
      createdAt: '2026-09-01T08:30:00.000Z',
    },
    {
      id: 'std-sma-0003',
      studentNumber: 'SMA-0003',
      fullName: 'Divine Favour Olumide',
      className: 'SSS 1 Science',
      gender: 'Female',
      guardianContact: '+234 809 555 1212',
      createdAt: '2026-09-01T09:00:00.000Z',
    },
  ];

  const starterResults: StudentResult[] = [
    {
      id: 'res-sma-0001-1',
      studentId: 'std-sma-0001',
      studentNumber: 'SMA-0001',
      studentFullName: 'Chukwuemeka David Emmanuel',
      className: 'JSS 1 Gold',
      academicSession: '2026/2027',
      term: 'First Term',
      pin: '54821',
      isPublished: true,
      subjects: [
        { id: 'sub-1', subject: 'Mathematics', ca1: 18, ca2: 19, exam: 54, total: 91, grade: 'A', remark: 'Distinction' },
        { id: 'sub-2', subject: 'English Language', ca1: 17, ca2: 18, exam: 50, total: 85, grade: 'A', remark: 'Distinction' },
        { id: 'sub-3', subject: 'Basic Science & Technology', ca1: 19, ca2: 18, exam: 51, total: 88, grade: 'A', remark: 'Distinction' },
        { id: 'sub-4', subject: 'Social Studies', ca1: 16, ca2: 17, exam: 47, total: 80, grade: 'A', remark: 'Distinction' },
        { id: 'sub-5', subject: 'Civic Education', ca1: 18, ca2: 18, exam: 52, total: 88, grade: 'A', remark: 'Distinction' },
        { id: 'sub-6', subject: 'Agricultural Science', ca1: 17, ca2: 16, exam: 48, total: 81, grade: 'A', remark: 'Distinction' },
        { id: 'sub-7', subject: 'Computer Studies / ICT', ca1: 20, ca2: 20, exam: 56, total: 96, grade: 'A', remark: 'Distinction' },
        { id: 'sub-8', subject: 'Business Studies', ca1: 16, ca2: 17, exam: 45, total: 78, grade: 'A', remark: 'Distinction' },
        { id: 'sub-9', subject: 'Christian Religious Studies', ca1: 19, ca2: 19, exam: 53, total: 91, grade: 'A', remark: 'Distinction' },
        { id: 'sub-10', subject: 'Physical & Health Education', ca1: 18, ca2: 17, exam: 49, total: 84, grade: 'A', remark: 'Distinction' },
      ],
      totalScore: 862,
      averageScore: 86.2,
      overallGrade: 'A',
      teacherRemark: 'An exceptional, diligent, and well-behaved student. Consistently punctual and proactive.',
      principalRemark: 'Outstanding academic performance. A true ambassador of academic excellence.',
      signedBy: 'Rev. Fr. Michael / Administrator',
      createdAt: '2026-09-02T10:00:00.000Z',
      updatedAt: '2026-09-02T10:00:00.000Z',
    },
    {
      id: 'res-sma-0002-1',
      studentId: 'std-sma-0002',
      studentNumber: 'SMA-0002',
      studentFullName: 'Fatima Zahra Mohammed',
      className: 'JSS 2 Diamond',
      academicSession: '2026/2027',
      term: 'First Term',
      pin: '89342',
      isPublished: true,
      subjects: [
        { id: 'sub-201', subject: 'Mathematics', ca1: 19, ca2: 18, exam: 56, total: 93, grade: 'A', remark: 'Distinction' },
        { id: 'sub-202', subject: 'English Language', ca1: 19, ca2: 19, exam: 53, total: 91, grade: 'A', remark: 'Distinction' },
        { id: 'sub-203', subject: 'Basic Science & Technology', ca1: 17, ca2: 18, exam: 52, total: 87, grade: 'A', remark: 'Distinction' },
        { id: 'sub-204', subject: 'Social Studies', ca1: 18, ca2: 17, exam: 49, total: 84, grade: 'A', remark: 'Distinction' },
        { id: 'sub-205', subject: 'Computer Studies / ICT', ca1: 20, ca2: 20, exam: 58, total: 98, grade: 'A', remark: 'Distinction' },
        { id: 'sub-206', subject: 'Agricultural Science', ca1: 16, ca2: 17, exam: 50, total: 83, grade: 'A', remark: 'Distinction' },
        { id: 'sub-207', subject: 'Civic Education', ca1: 18, ca2: 19, exam: 51, total: 88, grade: 'A', remark: 'Distinction' },
        { id: 'sub-208', subject: 'French Language', ca1: 18, ca2: 18, exam: 54, total: 90, grade: 'A', remark: 'Distinction' },
      ],
      totalScore: 714,
      averageScore: 89.25,
      overallGrade: 'A',
      teacherRemark: 'Brilliant intellectual aptitude, exemplary leadership, and immaculate handwriting.',
      principalRemark: 'Highest standing in JSS 2. Keep aiming for the pinnacle of academic distinction.',
      signedBy: 'Rev. Fr. Michael / Administrator',
      createdAt: '2026-09-02T10:30:00.000Z',
      updatedAt: '2026-09-02T10:30:00.000Z',
    },
    {
      id: 'res-sma-0003-1',
      studentId: 'std-sma-0003',
      studentNumber: 'SMA-0003',
      studentFullName: 'Divine Favour Olumide',
      className: 'SSS 1 Science',
      academicSession: '2026/2027',
      term: 'First Term',
      pin: '71209',
      isPublished: true,
      subjects: [
        { id: 'sub-301', subject: 'Mathematics', ca1: 20, ca2: 19, exam: 57, total: 96, grade: 'A', remark: 'Distinction' },
        { id: 'sub-302', subject: 'English Language', ca1: 18, ca2: 18, exam: 52, total: 88, grade: 'A', remark: 'Distinction' },
        { id: 'sub-303', subject: 'Physics', ca1: 19, ca2: 19, exam: 54, total: 92, grade: 'A', remark: 'Distinction' },
        { id: 'sub-304', subject: 'Chemistry', ca1: 17, ca2: 18, exam: 50, total: 85, grade: 'A', remark: 'Distinction' },
        { id: 'sub-305', subject: 'Biology', ca1: 18, ca2: 17, exam: 53, total: 88, grade: 'A', remark: 'Distinction' },
        { id: 'sub-306', subject: 'Further Mathematics', ca1: 19, ca2: 20, exam: 55, total: 94, grade: 'A', remark: 'Distinction' },
        { id: 'sub-307', subject: 'Technical Drawing', ca1: 17, ca2: 18, exam: 51, total: 86, grade: 'A', remark: 'Distinction' },
      ],
      totalScore: 629,
      averageScore: 89.86,
      overallGrade: 'A',
      teacherRemark: 'Analytical mind with great scientific curiosity. Excellent laboratory conduct.',
      principalRemark: 'Superb scientific mastery. Commended by the Faculty Board of Examiners.',
      signedBy: 'Rev. Fr. Michael / Administrator',
      createdAt: '2026-09-02T11:00:00.000Z',
      updatedAt: '2026-09-02T11:00:00.000Z',
    },
  ];

  const starterPins: PinRecord[] = [
    {
      id: 'pin-sma-0001-1',
      pin: '54821',
      studentId: 'std-sma-0001',
      studentNumber: 'SMA-0001',
      studentFullName: 'Chukwuemeka David Emmanuel',
      resultId: 'res-sma-0001-1',
      academicSession: '2026/2027',
      term: 'First Term',
      status: 'UNUSED',
      usedAt: null,
      createdAt: '2026-09-02T10:00:00.000Z',
    },
    {
      id: 'pin-sma-0002-1',
      pin: '89342',
      studentId: 'std-sma-0002',
      studentNumber: 'SMA-0002',
      studentFullName: 'Fatima Zahra Mohammed',
      resultId: 'res-sma-0002-1',
      academicSession: '2026/2027',
      term: 'First Term',
      status: 'UNUSED',
      usedAt: null,
      createdAt: '2026-09-02T10:30:00.000Z',
    },
    {
      id: 'pin-sma-0003-1',
      pin: '71209',
      studentId: 'std-sma-0003',
      studentNumber: 'SMA-0003',
      studentFullName: 'Divine Favour Olumide',
      resultId: 'res-sma-0003-1',
      academicSession: '2026/2027',
      term: 'First Term',
      status: 'UNUSED',
      usedAt: null,
      createdAt: '2026-09-02T11:00:00.000Z',
    },
  ];

  // If parsed data exists, return it
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.students)) {
        return {
          settings: parsed.settings || DEFAULT_SCHOOL_SETTINGS,
          students: parsed.students,
          results: parsed.results || [],
          pins: parsed.pins || [],
          gradeScales: parsed.gradeScales || DEFAULT_GRADE_SCALES,
          sessions: parsed.sessions || INITIAL_ACADEMIC_SESSIONS,
          backgrounds: parsed.backgrounds && parsed.backgrounds.length > 0 
            ? parsed.backgrounds 
            : BUILTIN_RESULT_BACKGROUNDS,
          monitoringLogs: parsed.monitoringLogs || [],
          adminPasswordHash: parsed.adminPasswordHash || hashPassword('Mary12345+'),
        };
      }
    } catch (err) {
      console.error('Error reading database file:', err);
    }
  }

  // If baked database backup exists, use it as baseline
  const BAKED_DB_FILE = path.join(process.cwd(), 'src', 'lib', 'bakedDatabase.json');
  if (fs.existsSync(BAKED_DB_FILE)) {
    try {
      const bakedData = JSON.parse(fs.readFileSync(BAKED_DB_FILE, 'utf-8'));
      if (bakedData && Array.isArray(bakedData.students)) {
        saveDatabase(bakedData);
        return bakedData;
      }
    } catch {}
  }

  // Initial first-run seed (only created if no file exists)
  const initialDb: DatabaseSchema = {
    settings: DEFAULT_SCHOOL_SETTINGS,
    students: starterStudents,
    results: starterResults,
    pins: starterPins,
    gradeScales: DEFAULT_GRADE_SCALES,
    sessions: INITIAL_ACADEMIC_SESSIONS,
    backgrounds: BUILTIN_RESULT_BACKGROUNDS,
    monitoringLogs: [],
    adminPasswordHash: hashPassword('Mary12345+'), // Default administrator credential
  };
  saveDatabase(initialDb);
  return initialDb;
}

// Save database to both local storage and permanent Cloud SQL
function saveDatabase(dataToSave: DatabaseSchema): void {
  // 1. Immediate local filesystem persistence
  try {
    const tempPath = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE);
  } catch (err) {
    console.error('Failed to save database to local cache:', err);
  }

  // 2. Permanent Cloud SQL persistence
  if (process.env.SQL_HOST && process.env.SQL_USER) {
    db.insert(appStore)
      .values({
        key: 'main_database',
        data: dataToSave,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appStore.key,
        set: {
          data: dataToSave,
          updatedAt: new Date(),
        },
      })
      .then(() => {
        // Successfully persisted to Cloud SQL
      })
      .catch((err) => {
        console.error('Cloud SQL async persistence notice:', err?.message || err);
      });
  }
}

// Global in-memory DB reference, initialized from local cache
let database: DatabaseSchema = loadDatabase();

// Asynchronously load the authoritative Cloud SQL state on startup
async function initCloudSqlData() {
  if (process.env.SQL_HOST && process.env.SQL_USER) {
    try {
      const records = await db
        .select()
        .from(appStore)
        .where(eq(appStore.key, 'main_database'))
        .limit(1);

      if (records.length > 0 && records[0].data) {
        const remoteData = records[0].data as DatabaseSchema;
        if (remoteData && Array.isArray(remoteData.students)) {
          database = remoteData;
          // Update local cache
          try {
            fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf-8');
          } catch {}
          console.log(`[Cloud SQL] Loaded permanent database with ${database.students.length} students, ${database.results.length} results.`);
          return;
        }
      }

      // If Cloud SQL has no record yet, seed it with current state
      await db.insert(appStore)
        .values({
          key: 'main_database',
          data: database,
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
      console.log('[Cloud SQL] Initialized permanent database store.');
    } catch (err) {
      console.error('[Cloud SQL] Notice on startup:', err);
    }
  }
}

initCloudSqlData();

// Auth Middleware for Admin routes
function authAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }
  const token = authHeader.substring(7);
  if (!activeSessions.has(token)) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
  next();
}

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// Get public school configuration (Branding, Motto, Logo, Active Certificate Background)
app.get('/api/public/config', (req: Request, res: Response) => {
  const activeBg = database.backgrounds.find(b => b.id === database.settings.activeBackgroundId) 
    || database.backgrounds[0];
  
  const publicConfig: PublicSchoolConfig = {
    schoolName: database.settings.schoolName,
    established: database.settings.established,
    portalTitle: database.settings.portalTitle,
    motto: database.settings.motto,
    logoUrl: database.settings.logoUrl,
    signedBy: database.settings.defaultRemarks.signedBy || 'Rev. Fr. Michael / Administrator',
    activeBackground: activeBg,
  };
  return res.json(publicConfig);
});

// Atomic result verification
app.post('/api/public/verify-result', (req: Request, res: Response) => {
  const { studentFullName, pin } = req.body;

  // Exact prompt requirement:
  // If the student name or PIN fields are empty, display exactly:
  // "Please enter your full name and result PIN."
  if (!studentFullName || !pin || !studentFullName.toString().trim() || !pin.toString().trim()) {
    return res.status(400).json({
      success: false,
      message: 'Please enter your full name and result PIN.',
    });
  }

  const queryName = studentFullName.toString().trim();
  const queryPin = pin.toString().trim();
  const now = new Date().toISOString();

  // Find pin record
  const pinRecord = database.pins.find(p => p.pin === queryPin);

  // If PIN does not exist or Student name does not match
  const isNameMatch = pinRecord && 
    pinRecord.studentFullName.trim().toLowerCase() === queryName.toLowerCase();

  if (!pinRecord || !isNameMatch) {
    // Log failed attempt in monitoring
    const log: ResultMonitoringLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      studentFullName: queryName,
      studentNumber: pinRecord ? pinRecord.studentNumber : 'UNKNOWN',
      academicSession: pinRecord ? pinRecord.academicSession : database.settings.currentSession,
      term: pinRecord ? pinRecord.term : database.settings.currentTerm,
      pin: queryPin,
      pinStatus: pinRecord ? pinRecord.status : 'UNUSED',
      userAgent: req.headers['user-agent'] || 'Unknown',
      success: false,
      message: 'Incorrect student name or PIN.',
    };
    database.monitoringLogs.unshift(log);
    saveDatabase(database);

    // Exact prompt requirement:
    // If the name/PIN is incorrect, display exactly:
    // "Incorrect student name or PIN. Please check your details and try again."
    return res.status(400).json({
      success: false,
      message: 'Incorrect student name or PIN. Please check your details and try again.',
    });
  }

  // Find associated result
  const result = database.results.find(r => r.id === pinRecord.resultId);

  // If result is not published:
  // Exact prompt requirement:
  // If the result exists but has not been published, display exactly:
  // "Your result is not yet available. Please contact the school."
  if (!result || !result.isPublished) {
    const log: ResultMonitoringLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      studentFullName: pinRecord.studentFullName,
      studentNumber: pinRecord.studentNumber,
      academicSession: pinRecord.academicSession,
      term: pinRecord.term,
      pin: pinRecord.pin,
      pinStatus: pinRecord.status,
      userAgent: req.headers['user-agent'] || 'Unknown',
      success: false,
      message: 'Result not yet published.',
    };
    database.monitoringLogs.unshift(log);
    saveDatabase(database);

    return res.status(400).json({
      success: false,
      message: 'Your result is not yet available. Please contact the school.',
    });
  }

  // If PIN has already been used:
  // Exact prompt requirement:
  // If the PIN has already been used, display exactly:
  // "This result PIN has already been used. Please contact the school."
  if (pinRecord.status === 'USED') {
    const log: ResultMonitoringLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      studentFullName: pinRecord.studentFullName,
      studentNumber: pinRecord.studentNumber,
      academicSession: pinRecord.academicSession,
      term: pinRecord.term,
      pin: pinRecord.pin,
      pinStatus: 'USED',
      userAgent: req.headers['user-agent'] || 'Unknown',
      success: false,
      message: 'PIN already used.',
    };
    database.monitoringLogs.unshift(log);
    saveDatabase(database);

    return res.status(400).json({
      success: false,
      message: 'This result PIN has already been used. Please contact the school.',
    });
  }

  // Atomic transition: UNUSED -> USED
  // Exact prompt requirement:
  // When a student successfully checks a result for the first time: UNUSED -> USED
  // When verification succeeds, display exactly: "Result verified successfully."
  pinRecord.status = 'USED';
  pinRecord.usedAt = now;

  const log: ResultMonitoringLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    studentFullName: pinRecord.studentFullName,
    studentNumber: pinRecord.studentNumber,
    academicSession: pinRecord.academicSession,
    term: pinRecord.term,
    pin: pinRecord.pin,
    pinStatus: 'USED',
    userAgent: req.headers['user-agent'] || 'Unknown',
    success: true,
    message: 'Result verified successfully.',
  };
  database.monitoringLogs.unshift(log);
  saveDatabase(database);

  const activeBg = database.backgrounds.find(b => b.id === database.settings.activeBackgroundId) 
    || database.backgrounds[0];

  return res.json({
    success: true,
    message: 'Result verified successfully.',
    result,
    schoolSettings: {
      schoolName: database.settings.schoolName,
      established: database.settings.established,
      portalTitle: database.settings.portalTitle,
      motto: database.settings.motto,
      logoUrl: database.settings.logoUrl,
      signedBy: database.settings.defaultRemarks.signedBy || 'Rev. Fr. Michael / Administrator',
      activeBackground: activeBg,
    },
    background: activeBg,
  });
});

// ----------------------------------------------------
// ADMIN AUTHENTICATION
// ----------------------------------------------------

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password or PIN is required.' });
  }

  const incomingHash = hashPassword(password);
  // Strictly only the active database credential opens the portal
  const isValid = incomingHash === database.adminPasswordHash;

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid Admin credentials.' });
  }

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.add(token);

  return res.json({
    success: true,
    token,
    message: 'Authenticated successfully.',
  });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Change admin credential
app.post('/api/admin/change-credential', authAdmin, (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Both old and new passwords are required.' });
  }

  if (hashPassword(oldPassword) !== database.adminPasswordHash) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  if (newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters.' });
  }

  database.adminPasswordHash = hashPassword(newPassword);
  saveDatabase(database);

  return res.json({
    success: true,
    message: 'Admin credential updated successfully. Old credential is now invalid.',
  });
});

// ----------------------------------------------------
// ADMIN DATA CRUD
// ----------------------------------------------------

// Fetch complete admin state
app.get('/api/admin/data', authAdmin, (req: Request, res: Response) => {
  return res.json({
    settings: database.settings,
    students: database.students,
    results: database.results,
    pins: database.pins,
    gradeScales: database.gradeScales,
    sessions: database.sessions,
    backgrounds: database.backgrounds,
    monitoringLogs: database.monitoringLogs,
  });
});

// Update school settings (motto, name, pinLength, maxScores, defaultRemarks, etc.)
app.post('/api/admin/settings', authAdmin, (req: Request, res: Response) => {
  const newSettings: Partial<SchoolSettings> = req.body;
  database.settings = { ...database.settings, ...newSettings };

  // If signedBy is updated globally, apply to all existing results
  if (newSettings.defaultRemarks?.signedBy) {
    const globalSign = newSettings.defaultRemarks.signedBy.trim();
    database.results.forEach(r => {
      r.signedBy = globalSign;
    });
  }

  saveDatabase(database);
  return res.json({ success: true, settings: database.settings, results: database.results });
});

// STUDENT CRUD
app.post('/api/admin/students/save', authAdmin, (req: Request, res: Response) => {
  const studentData: Student = req.body;

  if (!studentData.fullName || !studentData.studentNumber || !studentData.className) {
    return res.status(400).json({ error: 'Full Name, Student Number, and Class are required.' });
  }

  // Prevent duplicate student numbers
  const duplicate = database.students.find(
    s => s.studentNumber.trim().toUpperCase() === studentData.studentNumber.trim().toUpperCase() && 
         s.id !== studentData.id
  );
  if (duplicate) {
    return res.status(400).json({ error: `Student number "${studentData.studentNumber}" is already assigned to ${duplicate.fullName}.` });
  }

  const existingIndex = database.students.findIndex(s => s.id === studentData.id);
  if (existingIndex >= 0) {
    const oldNumber = database.students[existingIndex].studentNumber;
    database.students[existingIndex] = { ...studentData };

    // When student number is edited, permanently update everywhere it appears
    if (oldNumber !== studentData.studentNumber) {
      database.results.forEach(r => {
        if (r.studentId === studentData.id || r.studentNumber === oldNumber) {
          r.studentNumber = studentData.studentNumber;
          r.studentFullName = studentData.fullName;
        }
      });
      database.pins.forEach(p => {
        if (p.studentId === studentData.id || p.studentNumber === oldNumber) {
          p.studentNumber = studentData.studentNumber;
          p.studentFullName = studentData.fullName;
        }
      });
    }
  } else {
    database.students.push({
      ...studentData,
      id: studentData.id || `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    });
  }

  saveDatabase(database);
  return res.json({ success: true, students: database.students });
});

app.post('/api/admin/students/delete', authAdmin, (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Student ID is required.' });

  database.students = database.students.filter(s => s.id !== id);
  // Also remove associated results and pins
  database.results = database.results.filter(r => r.studentId !== id);
  database.pins = database.pins.filter(p => p.studentId !== id);

  saveDatabase(database);
  return res.json({ success: true, students: database.students });
});

// RESULTS CRUD
app.post('/api/admin/results/save', authAdmin, (req: Request, res: Response) => {
  const resultData: StudentResult = req.body;

  if (!resultData.studentId || !resultData.className || !resultData.academicSession || !resultData.term) {
    return res.status(400).json({ error: 'Student, Class, Academic Session, and Term are required.' });
  }

  const student = database.students.find(s => s.id === resultData.studentId);
  if (!student) {
    return res.status(400).json({ error: 'Selected student does not exist.' });
  }

  // Calculate subjects total and grades
  const maxCa1 = database.settings.maxScores.ca1;
  const maxCa2 = database.settings.maxScores.ca2;
  const maxExam = database.settings.maxScores.exam;

  const validatedSubjects = (resultData.subjects || []).map(subj => {
    const ca1 = Math.min(Math.max(0, Number(subj.ca1) || 0), maxCa1);
    const ca2 = Math.min(Math.max(0, Number(subj.ca2) || 0), maxCa2);
    const exam = Math.min(Math.max(0, Number(subj.exam) || 0), maxExam);
    const total = ca1 + ca2 + exam;
    const { grade, remark } = calculateGrade(total, database.gradeScales);
    return {
      id: subj.id || `subj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subject: subj.subject.trim(),
      ca1,
      ca2,
      exam,
      total,
      grade,
      remark,
    };
  });

  const totalScore = validatedSubjects.reduce((sum, s) => sum + s.total, 0);
  const averageScore = validatedSubjects.length > 0 
    ? Number((totalScore / validatedSubjects.length).toFixed(1)) 
    : 0;
  const overallGrade = calculateGrade(averageScore, database.gradeScales).grade;

  // PIN Assignment: Manual entry or Automatic Unique Generation
  let pinCode = '';
  if (resultData.pin && resultData.pin.toString().trim()) {
    pinCode = resultData.pin.toString().trim();
    if (!/^\d+$/.test(pinCode)) {
      return res.status(400).json({ error: 'Result PIN must consist of numbers only.' });
    }
    // Check if another result or pin record already uses this PIN
    const duplicate = database.pins.find(p => p.pin === pinCode && p.resultId !== resultData.id);
    if (duplicate) {
      return res.status(400).json({ 
        error: `PIN ${pinCode} is already assigned to ${duplicate.studentFullName}. Please enter a different PIN or generate a unique one.` 
      });
    }
  } else {
    const existingPinRecord = database.pins.find(p => p.resultId === resultData.id);
    if (existingPinRecord) {
      pinCode = existingPinRecord.pin;
    } else {
      const existingPinsSet = new Set(database.pins.map(p => p.pin));
      const pinLength = database.settings.pinLength === -1 
        ? (database.settings.customPinLength || 5) 
        : (database.settings.pinLength || 5);
      pinCode = generateNumericPin(pinLength, existingPinsSet);
    }
  }

  const resultId = resultData.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const finalResult: StudentResult = {
    ...resultData,
    id: resultId,
    studentId: student.id,
    studentNumber: student.studentNumber,
    studentFullName: student.fullName,
    className: resultData.className,
    academicSession: resultData.academicSession,
    term: resultData.term,
    pin: pinCode,
    isPublished: typeof resultData.isPublished === 'boolean' ? resultData.isPublished : true,
    subjects: validatedSubjects,
    totalScore,
    averageScore,
    overallGrade,
    teacherRemark: resultData.teacherRemark || database.settings.defaultRemarks.teacherRemark,
    principalRemark: resultData.principalRemark || database.settings.defaultRemarks.principalRemark,
    signedBy: database.settings.defaultRemarks.signedBy || resultData.signedBy || 'Rev. Fr. Michael / Administrator',
    createdAt: resultData.createdAt || now,
    updatedAt: now,
  };

  // Upsert result
  const resIndex = database.results.findIndex(r => r.id === resultId);
  if (resIndex >= 0) {
    database.results[resIndex] = finalResult;
  } else {
    database.results.push(finalResult);
  }

  // Ensure PIN record is created/synced with the new or preserved pinCode
  const pinIndex = database.pins.findIndex(p => p.resultId === resultId);
  if (pinIndex >= 0) {
    database.pins[pinIndex].pin = pinCode;
    database.pins[pinIndex].studentFullName = student.fullName;
    database.pins[pinIndex].studentNumber = student.studentNumber;
    database.pins[pinIndex].academicSession = resultData.academicSession;
    database.pins[pinIndex].term = resultData.term;
  } else {
    database.pins.push({
      id: `pin-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pin: pinCode,
      studentId: student.id,
      studentNumber: student.studentNumber,
      studentFullName: student.fullName,
      resultId: finalResult.id,
      academicSession: resultData.academicSession,
      term: resultData.term,
      status: 'UNUSED',
      usedAt: null,
      createdAt: now,
    });
  }

  saveDatabase(database);
  return res.json({ success: true, result: finalResult, pins: database.pins });
});

app.post('/api/admin/results/delete', authAdmin, (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Result ID is required.' });

  database.results = database.results.filter(r => r.id !== id);
  database.pins = database.pins.filter(p => p.resultId !== id);

  saveDatabase(database);
  return res.json({ success: true, results: database.results, pins: database.pins });
});

app.post('/api/admin/results/toggle-publish', authAdmin, (req: Request, res: Response) => {
  const { id } = req.body;
  const result = database.results.find(r => r.id === id);
  if (!result) return res.status(404).json({ error: 'Result not found.' });

  result.isPublished = !result.isPublished;
  saveDatabase(database);
  return res.json({ success: true, result });
});

// PIN MANAGEMENT
// Reset a USED PIN back to UNUSED (exact prompt requirement: keep SAME pin, change status)
app.post('/api/admin/pins/reset', authAdmin, (req: Request, res: Response) => {
  const { pinId } = req.body;
  const pinRecord = database.pins.find(p => p.id === pinId);
  if (!pinRecord) {
    return res.status(404).json({ error: 'PIN record not found.' });
  }

  pinRecord.status = 'UNUSED';
  pinRecord.usedAt = null;
  saveDatabase(database);

  return res.json({
    success: true,
    message: `PIN ${pinRecord.pin} reset to UNUSED successfully.`,
    pinRecord,
  });
});

// Generate unique numeric PIN on demand
app.post('/api/admin/pins/generate-unique', authAdmin, (req: Request, res: Response) => {
  const pinLength = database.settings.pinLength === -1 
    ? (database.settings.customPinLength || 5) 
    : (database.settings.pinLength || 5);
  const existingPinsSet = new Set(database.pins.map(p => p.pin));
  const pin = generateNumericPin(pinLength, existingPinsSet);
  return res.json({ success: true, pin });
});

// Edit / Update PIN
app.post('/api/admin/pins/update', authAdmin, (req: Request, res: Response) => {
  const { pinId, pin } = req.body;
  if (!pinId || !pin) {
    return res.status(400).json({ error: 'PIN ID and new PIN are required.' });
  }
  const cleanPin = pin.toString().trim();
  if (!/^\d+$/.test(cleanPin)) {
    return res.status(400).json({ error: 'PIN must consist of numbers only.' });
  }

  const duplicate = database.pins.find(p => p.pin === cleanPin && p.id !== pinId);
  if (duplicate) {
    return res.status(400).json({ 
      error: `The PIN ${cleanPin} is already assigned to ${duplicate.studentFullName}. Please choose another PIN.` 
    });
  }

  const pinRecord = database.pins.find(p => p.id === pinId);
  if (!pinRecord) {
    return res.status(404).json({ error: 'PIN record not found.' });
  }

  pinRecord.pin = cleanPin;
  // Sync to student's result
  const result = database.results.find(r => r.id === pinRecord.resultId);
  if (result) {
    result.pin = cleanPin;
  }

  saveDatabase(database);
  return res.json({ 
    success: true, 
    message: `PIN updated to ${cleanPin} permanently.`, 
    pinRecord, 
    results: database.results, 
    pins: database.pins 
  });
});

// Delete PIN permanently
app.post('/api/admin/pins/delete', authAdmin, (req: Request, res: Response) => {
  const { pinId } = req.body;
  if (!pinId) {
    return res.status(400).json({ error: 'PIN ID is required.' });
  }
  database.pins = database.pins.filter(p => p.id !== pinId);
  saveDatabase(database);
  return res.json({ success: true, pins: database.pins });
});

// GRADE SCALES
app.post('/api/admin/grades/save', authAdmin, (req: Request, res: Response) => {
  const { scales } = req.body;
  if (!Array.isArray(scales)) {
    return res.status(400).json({ error: 'Invalid scales format.' });
  }

  database.gradeScales = scales;

  // Recalculate existing results with new grading scale
  database.results.forEach(resRecord => {
    resRecord.subjects.forEach(subj => {
      const g = calculateGrade(subj.total, scales);
      subj.grade = g.grade;
      subj.remark = g.remark;
    });
    resRecord.overallGrade = calculateGrade(resRecord.averageScore, scales).grade;
  });

  saveDatabase(database);
  return res.json({ success: true, gradeScales: database.gradeScales, results: database.results });
});

// ACADEMIC SESSIONS & TERMS
app.post('/api/admin/sessions/add', authAdmin, (req: Request, res: Response) => {
  const { session } = req.body;
  if (!session || !session.trim()) {
    return res.status(400).json({ error: 'Session name is required (e.g. 2032/2033).' });
  }

  const trimmed = session.trim();
  if (database.sessions.some(s => s.session === trimmed)) {
    return res.status(400).json({ error: 'This academic session already exists.' });
  }

  database.sessions.push({
    id: `sess-${Date.now()}`,
    session: trimmed,
    isCurrent: false,
  });

  saveDatabase(database);
  return res.json({ success: true, sessions: database.sessions });
});

app.post('/api/admin/sessions/set-current', authAdmin, (req: Request, res: Response) => {
  const { session, term } = req.body;
  if (session) {
    database.sessions.forEach(s => {
      s.isCurrent = s.session === session;
    });
    database.settings.currentSession = session;
  }
  if (term) {
    database.settings.currentTerm = term;
  }

  saveDatabase(database);
  return res.json({ success: true, settings: database.settings, sessions: database.sessions });
});

// LOGO & BACKGROUND UPLOADS (Supports gallery/files from Android & PC)
app.post('/api/admin/upload-logo', authAdmin, (req: Request, res: Response) => {
  const { dataUrl } = req.body;
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Valid image data is required.' });
  }

  try {
    // Store dataUrl directly in settings so it is permanently saved in Cloud SQL
    // and is immediately visible on all devices, replicas, and portals without disk loss
    database.settings.logoUrl = dataUrl;
    saveDatabase(database);

    return res.json({
      success: true,
      logoUrl: dataUrl,
      message: 'School logo updated and saved permanently.',
    });
  } catch (err: any) {
    console.error('Logo upload error:', err);
    return res.status(500).json({ error: 'Failed to save uploaded logo.' });
  }
});

// Upload new certificate background
app.post('/api/admin/upload-background', authAdmin, (req: Request, res: Response) => {
  const { name, dataUrl } = req.body;
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Valid background image is required.' });
  }

  try {
    const newBg: ResultBackground = {
      id: `bg-up-${Date.now()}`,
      name: name?.trim() || `Custom Background ${database.backgrounds.length + 1}`,
      type: 'uploaded',
      url: dataUrl,
      themeStyle: 'custom',
      isProtected: false,
    };

    database.backgrounds.push(newBg);
    saveDatabase(database);

    return res.json({
      success: true,
      background: newBg,
      backgrounds: database.backgrounds,
      message: 'Result background uploaded and saved permanently.',
    });
  } catch (err: any) {
    console.error('Background upload error:', err);
    return res.status(500).json({ error: 'Failed to save uploaded background.' });
  }
});

// Delete uploaded background (protected built-ins cannot be deleted)
app.post('/api/admin/background/delete', authAdmin, (req: Request, res: Response) => {
  const { id } = req.body;
  const bg = database.backgrounds.find(b => b.id === id);
  if (!bg) return res.status(404).json({ error: 'Background not found.' });

  if (bg.isProtected) {
    return res.status(400).json({ error: 'Built-in certificate backgrounds are protected and cannot be deleted.' });
  }

  // If deleted background is active, fallback to default
  if (database.settings.activeBackgroundId === id) {
    database.settings.activeBackgroundId = 'bg-classic-parchment';
  }

  database.backgrounds = database.backgrounds.filter(b => b.id !== id);
  saveDatabase(database);

  return res.json({
    success: true,
    backgrounds: database.backgrounds,
    activeBackgroundId: database.settings.activeBackgroundId,
  });
});

// Set active result background
app.post('/api/admin/background/set-active', authAdmin, (req: Request, res: Response) => {
  const { id } = req.body;
  if (!database.backgrounds.some(b => b.id === id)) {
    return res.status(404).json({ error: 'Background not found.' });
  }

  database.settings.activeBackgroundId = id;
  saveDatabase(database);

  return res.json({ success: true, activeBackgroundId: id });
});

// SYNC route for Admin Header SYNC button
app.post('/api/admin/sync', authAdmin, async (req: Request, res: Response) => {
  // Pull directly from Cloud SQL if available
  if (process.env.SQL_HOST && process.env.SQL_USER) {
    try {
      const records = await db
        .select()
        .from(appStore)
        .where(eq(appStore.key, 'main_database'))
        .limit(1);

      if (records.length > 0 && records[0].data) {
        database = records[0].data as DatabaseSchema;
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf-8');
        } catch {}
      }
    } catch (err) {
      console.error('Error syncing from Cloud SQL:', err);
    }
  } else {
    database = loadDatabase();
  }

  return res.json({
    success: true,
    message: 'Synchronized with permanent database successfully.',
    data: {
      settings: database.settings,
      studentsCount: database.students.length,
      resultsCount: database.results.length,
      pinsCount: database.pins.length,
    },
  });
});

// Serve downloads folder
app.use('/downloads', express.static(path.join(process.cwd(), 'public', 'downloads')));

// Dynamic full database export
app.get('/api/admin/backup/export', authAdmin, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=st_michael_academy_db_backup_${new Date().toISOString().slice(0, 10)}.json`
  );
  return res.json(database);
});

// Restore full database from backup JSON
app.post('/api/admin/backup/restore', authAdmin, (req: Request, res: Response) => {
  const backupData = req.body;
  if (!backupData || !Array.isArray(backupData.students)) {
    return res.status(400).json({ error: 'Invalid backup file format. Missing students array.' });
  }

  database = {
    settings: backupData.settings || database.settings,
    students: backupData.students || [],
    results: backupData.results || [],
    pins: backupData.pins || [],
    gradeScales: backupData.gradeScales || database.gradeScales,
    sessions: backupData.sessions || database.sessions,
    backgrounds: backupData.backgrounds || database.backgrounds,
    monitoringLogs: backupData.monitoringLogs || [],
    adminPasswordHash: backupData.adminPasswordHash || database.adminPasswordHash,
  };

  saveDatabase(database);
  return res.json({
    success: true,
    message: `Database restored successfully: ${database.students.length} students, ${database.results.length} results, ${database.pins.length} PINs.`,
    data: {
      studentsCount: database.students.length,
      resultsCount: database.results.length,
      pinsCount: database.pins.length,
    },
  });
});

// ----------------------------------------------------
// VITE MIDDLEWARE / SPA SERVE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ST. MICHAEL GREAT ACADEMY Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
