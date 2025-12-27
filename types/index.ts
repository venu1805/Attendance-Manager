export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
  totalClasses: number;
  attendedClasses: number;
  createdAt: number;
  updatedAt?: number;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  userId: string;
  date: number;
  type: 'present' | 'bunked';
}

export interface AppSettings {
  targetPercentage: number;
}

export interface SubjectStats {
  currentPercentage: number;
  safeToBunk: number;
  mustAttend: number;
  status: 'safe' | 'warning' | 'critical';
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  usn?: string;
  semester?: number;
  collegeName?: string;
  mobileNumber?: string;
}
