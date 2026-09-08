import {
  PublicSchoolConfig,
  VerificationResponse,
  Student,
  StudentResult,
  PinRecord,
  GradeScale,
  ResultBackground,
  AcademicSession,
  SchoolSettings,
} from '../types';

const TOKEN_KEY = 'smga_admin_token';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

// Fetch public portal settings
export async function getPublicConfig(): Promise<PublicSchoolConfig> {
  const res = await fetch('/api/public/config');
  if (!res.ok) {
    throw new Error('Failed to load portal configuration.');
  }
  return res.json();
}

// Verify result
export async function verifyResult(
  studentFullName: string,
  pin: string
): Promise<VerificationResponse> {
  const res = await fetch('/api/public/verify-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentFullName, pin }),
  });
  const data = await res.json();
  return data;
}

// Admin API caller with Bearer token
async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAdminToken();
  if (!token) {
    throw new Error('Admin is not logged in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const res = await fetch(endpoint, { ...options, headers });
  if (res.status === 401) {
    removeAdminToken();
    throw new Error('Session expired or unauthorized. Please log in again.');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

export async function adminLogin(password: string): Promise<string> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid Admin credentials.');
  }
  setAdminToken(data.token);
  return data.token;
}

export async function adminLogout(): Promise<void> {
  const token = getAdminToken();
  removeAdminToken();
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
}

export async function changeAdminCredential(oldPassword: string, newPassword: string) {
  return adminFetch('/api/admin/change-credential', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function getAdminData() {
  return adminFetch('/api/admin/data');
}

export async function saveAdminSettings(settings: Partial<SchoolSettings>) {
  return adminFetch('/api/admin/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

export async function saveStudent(student: Partial<Student>) {
  return adminFetch('/api/admin/students/save', {
    method: 'POST',
    body: JSON.stringify(student),
  });
}

export async function deleteStudent(id: string) {
  return adminFetch('/api/admin/students/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function saveResult(result: Partial<StudentResult>) {
  return adminFetch('/api/admin/results/save', {
    method: 'POST',
    body: JSON.stringify(result),
  });
}

export async function deleteResult(id: string) {
  return adminFetch('/api/admin/results/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function togglePublishResult(id: string) {
  return adminFetch('/api/admin/results/toggle-publish', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function resetPin(pinId: string) {
  return adminFetch('/api/admin/pins/reset', {
    method: 'POST',
    body: JSON.stringify({ pinId }),
  });
}

export async function generateUniquePin(): Promise<{ success: boolean; pin: string }> {
  return adminFetch('/api/admin/pins/generate-unique', {
    method: 'POST',
  });
}

export async function updatePin(pinId: string, pin: string) {
  return adminFetch('/api/admin/pins/update', {
    method: 'POST',
    body: JSON.stringify({ pinId, pin }),
  });
}

export async function deletePin(pinId: string) {
  return adminFetch('/api/admin/pins/delete', {
    method: 'POST',
    body: JSON.stringify({ pinId }),
  });
}

export async function saveGradeScales(scales: GradeScale[]) {
  return adminFetch('/api/admin/grades/save', {
    method: 'POST',
    body: JSON.stringify({ scales }),
  });
}

export async function addAcademicSession(session: string) {
  return adminFetch('/api/admin/sessions/add', {
    method: 'POST',
    body: JSON.stringify({ session }),
  });
}

export async function setCurrentSessionTerm(session: string, term: string) {
  return adminFetch('/api/admin/sessions/set-current', {
    method: 'POST',
    body: JSON.stringify({ session, term }),
  });
}

export async function uploadSchoolLogo(dataUrl: string) {
  return adminFetch('/api/admin/upload-logo', {
    method: 'POST',
    body: JSON.stringify({ dataUrl }),
  });
}

export async function uploadResultBackground(name: string, dataUrl: string) {
  return adminFetch('/api/admin/upload-background', {
    method: 'POST',
    body: JSON.stringify({ name, dataUrl }),
  });
}

export async function deleteResultBackground(id: string) {
  return adminFetch('/api/admin/background/delete', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function setActiveResultBackground(id: string) {
  return adminFetch('/api/admin/background/set-active', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function syncDatabase() {
  return adminFetch('/api/admin/sync', { method: 'POST' });
}

export async function restoreDatabaseBackup(backupData: any) {
  return adminFetch('/api/admin/backup/restore', {
    method: 'POST',
    body: JSON.stringify(backupData),
  });
}
