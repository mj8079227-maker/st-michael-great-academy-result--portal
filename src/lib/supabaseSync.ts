import https from 'https';

const DEFAULT_SUPABASE_URL = 'https://aznwqnfvljtqqbijxvbg.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bndxbmZ2bGp0cXFiaWp4dmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MjYwMTUsImV4cCI6MjEwNDMwMjAxNX0.7ybbnCFAqCA6NKw4FNYsI2bQO2CiDOXuM6DGkSTE9sU';

// Safely validate that the URL is an actual https:// URL, and key is a valid JWT token
function getSupabaseConfig() {
  const envUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const url = (envUrl && typeof envUrl === 'string' && envUrl.trim().startsWith('http')) 
    ? envUrl.trim() 
    : DEFAULT_SUPABASE_URL;
  const key = (envKey && typeof envKey === 'string' && envKey.trim().startsWith('eyJ')) 
    ? envKey.trim() 
    : DEFAULT_SUPABASE_KEY;

  return { url, key };
}

const { url: SUPABASE_URL, key: SUPABASE_KEY } = getSupabaseConfig();

interface SupabaseResponse {
  status: number;
  data: any;
}

export function supabaseRequest(path: string, method: string = 'GET', body: any = null): Promise<SupabaseResponse> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(path.startsWith('http') ? path : `${SUPABASE_URL}/rest/v1/${path}`);
      const headers: Record<string, string> = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      };

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers
      };

      const req = https.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => raw += chunk);
        res.on('end', () => {
          try {
            const data = raw ? JSON.parse(raw) : null;
            resolve({ status: res.statusCode || 200, data });
          } catch {
            resolve({ status: res.statusCode || 200, data: raw });
          }
        });
      });

      req.on('error', (err) => {
        console.error('[Supabase Sync Error]:', err.message);
        resolve({ status: 500, data: null });
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    } catch (err: any) {
      console.error('[Supabase Exception]:', err?.message);
      resolve({ status: 500, data: null });
    }
  });
}

/**
 * Synchronize the in-memory/local state directly to Supabase cloud tables.
 */
export async function syncDatabaseToSupabase(dbData: any): Promise<void> {
  if (!dbData) return;

  try {
    // 1. Sync Settings
    if (dbData.settings) {
      await supabaseRequest('school_settings?id=eq.current', 'PATCH', {
        id: 'current',
        school_name: dbData.settings.schoolName || dbData.settings.name || 'ST. MICHAEL GREAT ACADEMY',
        school_motto: dbData.settings.motto || 'Learning is fun',
        portal_title: dbData.settings.portalTitle || 'OFFICIAL RESULT PORTAL',
        first_ca_max: dbData.settings.maxScores?.ca1 ?? dbData.settings.firstCaMax ?? 20,
        second_ca_max: dbData.settings.maxScores?.ca2 ?? dbData.settings.secondCaMax ?? 20,
        exam_max: dbData.settings.maxScores?.exam ?? dbData.settings.examMax ?? 60,
        overall_max: (dbData.settings.maxScores?.ca1 ?? 20) + (dbData.settings.maxScores?.ca2 ?? 20) + (dbData.settings.maxScores?.exam ?? 60),
        class_teacher_remark_default: dbData.settings.defaultRemarks?.teacherRemark || null,
        head_teacher_remark_default: dbData.settings.defaultRemarks?.principalRemark || null,
        result_signed_by: dbData.settings.defaultRemarks?.signedBy || null,
        pin_length: dbData.settings.pinLength || 5,
        current_session: dbData.settings.currentSession || '2026/2027',
        current_term: dbData.settings.currentTerm || 'First Term',
        active_background_id: dbData.settings.activeBackgroundId || 'bg-classic-parchment',
        grade_scales: dbData.gradeScales || [],
        sessions: dbData.sessions || [],
        terms: ['First Term', 'Second Term', 'Third Term'],
        updated_at: new Date().toISOString()
      });
    }

    // 2. Sync Students
    if (Array.isArray(dbData.students)) {
      for (const s of dbData.students) {
        await supabaseRequest('students?on_conflict=student_number', 'POST', {
          id: s.id,
          student_number: s.studentNumber,
          full_name: s.fullName,
          current_class: s.className,
          gender: s.gender || 'Not Specified',
          guardian_phone: s.guardianContact || s.guardianPhone || null,
          updated_at: new Date().toISOString()
        });
      }
    }

    // 3. Sync Results
    if (Array.isArray(dbData.results)) {
      for (const r of dbData.results) {
        await supabaseRequest('results?on_conflict=student_id,session,term', 'POST', {
          id: r.id,
          student_id: r.studentId,
          student_number: r.studentNumber,
          student_full_name: r.studentFullName,
          session: r.academicSession || '2026/2027',
          term: r.term || 'First Term',
          class: r.className,
          subjects: r.subjects || [],
          total_score: r.totalScore,
          percentage: r.averageScore,
          overall_grade: r.overallGrade,
          class_teacher_remark: r.teacherRemark,
          head_teacher_remark: r.principalRemark,
          result_signed_by: r.signedBy || dbData.settings?.defaultRemarks?.signedBy || 'Mrs Mary',
          is_published: r.isPublished !== false,
          updated_at: new Date().toISOString()
        });
      }
    }

    // 4. Sync PINs
    if (Array.isArray(dbData.pins)) {
      for (const p of dbData.pins) {
        await supabaseRequest('pins?on_conflict=pin', 'POST', {
          id: p.id,
          pin: p.pin,
          student_id: p.studentId,
          student_number: p.studentNumber,
          student_full_name: p.studentFullName,
          session: p.academicSession || '2026/2027',
          term: p.term || 'First Term',
          status: p.status || 'UNUSED',
          used_at: p.usedAt || null,
          updated_at: new Date().toISOString()
        });
      }
    }
  } catch (err: any) {
    console.error('[Supabase Full Sync Exception]:', err?.message);
  }
}

/**
 * Fetch all students, results, pins, and settings from Supabase
 */
export async function loadDatabaseFromSupabase(): Promise<{
  students?: any[];
  results?: any[];
  pins?: any[];
  settings?: any;
  gradeScales?: any[];
  sessions?: any[];
} | null> {
  try {
    const [studentsRes, resultsRes, pinsRes, settingsRes] = await Promise.all([
      supabaseRequest('students?select=*'),
      supabaseRequest('results?select=*'),
      supabaseRequest('pins?select=*'),
      supabaseRequest('school_settings?id=eq.current&limit=1'),
    ]);

    if (studentsRes.status !== 200 || !Array.isArray(studentsRes.data)) {
      return null;
    }

    const students = (studentsRes.data || []).map((s: any) => ({
      id: s.id,
      studentNumber: s.student_number,
      fullName: s.full_name,
      className: s.current_class || 'JSS 1',
      gender: s.gender || 'Not Specified',
      guardianContact: s.guardian_phone || '',
      createdAt: s.created_at || new Date().toISOString(),
    }));

    const pins = (pinsRes.data || []).map((p: any) => ({
      id: p.id,
      pin: p.pin,
      studentId: p.student_id,
      studentNumber: p.student_number,
      studentFullName: p.student_full_name,
      resultId: '',
      academicSession: p.session || '2026/2027',
      term: p.term || 'First Term',
      status: p.status || 'UNUSED',
      usedAt: p.used_at || null,
      createdAt: p.created_at || new Date().toISOString(),
    }));

    const results = (resultsRes.data || []).map((r: any) => {
      // Find matching pin for this student
      const matchingPin = pins.find(p => p.studentNumber === r.student_number && p.term === r.term);
      const pinCode = matchingPin ? matchingPin.pin : '';
      if (matchingPin) {
        matchingPin.resultId = r.id;
      }

      return {
        id: r.id,
        studentId: r.student_id,
        studentNumber: r.student_number,
        studentFullName: r.student_full_name,
        className: r.class,
        academicSession: r.session || '2026/2027',
        term: r.term || 'First Term',
        pin: pinCode,
        isPublished: r.is_published !== false,
        subjects: Array.isArray(r.subjects) ? r.subjects : [],
        totalScore: Number(r.total_score) || 0,
        averageScore: Number(r.percentage) || 0,
        overallGrade: r.overall_grade || 'A',
        teacherRemark: r.class_teacher_remark || 'Distinction',
        principalRemark: r.head_teacher_remark || 'Promoted',
        signedBy: r.result_signed_by || 'Mrs Mary',
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at || new Date().toISOString(),
      };
    });

    let settings: any = null;
    let gradeScales: any[] | undefined = undefined;
    let sessions: any[] | undefined = undefined;

    if (settingsRes.status === 200 && Array.isArray(settingsRes.data) && settingsRes.data.length > 0) {
      const s = settingsRes.data[0];
      settings = {
        schoolName: s.school_name || 'ST. MICHAEL GREAT ACADEMY',
        portalTitle: s.portal_title || 'OFFICIAL RESULT PORTAL',
        motto: s.school_motto || 'Learning is fun',
        maxScores: {
          ca1: s.first_ca_max ?? 20,
          ca2: s.second_ca_max ?? 20,
          exam: s.exam_max ?? 60,
        },
        defaultRemarks: {
          teacherRemark: s.class_teacher_remark_default || 'Hardworking and focused. Maintain this momentum.',
          principalRemark: s.head_teacher_remark_default || 'A wonderful academic display. Promoted with distinction.',
          signedBy: s.result_signed_by || 'Rev. Fr. Michael / Administrator',
        },
        pinLength: s.pin_length || 5,
        activeBackgroundId: s.active_background_id || 'bg-classic-parchment',
        currentSession: s.current_session || '2026/2027',
        currentTerm: s.current_term || 'First Term',
      };
      if (Array.isArray(s.grade_scales) && s.grade_scales.length > 0) {
        gradeScales = s.grade_scales;
      }
      if (Array.isArray(s.sessions) && s.sessions.length > 0) {
        sessions = s.sessions;
      }
    }

    return { students, results, pins, settings, gradeScales, sessions };
  } catch (err: any) {
    console.error('[Supabase Load Exception]:', err?.message);
    return null;
  }
}
