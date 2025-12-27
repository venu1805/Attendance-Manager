import { getSupabaseClient } from '@/template';
import { Subject, AttendanceRecord, AppSettings, UserProfile } from '@/types';

const supabase = getSupabaseClient();

// User Profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    fullName: data.full_name,
    usn: data.usn,
    semester: data.semester,
    collegeName: data.college_name,
    mobileNumber: data.mobile_number,
  };
}

export async function updateUserProfile(
  userId: string,
  profile: Partial<Omit<UserProfile, 'id' | 'email'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      username: profile.username,
      full_name: profile.fullName,
      usn: profile.usn,
      semester: profile.semester,
      college_name: profile.collegeName,
      mobile_number: profile.mobileNumber,
    })
    .eq('id', userId);
  
  return { error: error ? error.message : null };
}

// Subjects
export async function getSubjects(userId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    color: item.color,
    totalClasses: item.total_classes,
    attendedClasses: item.attended_classes,
    createdAt: new Date(item.created_at).getTime(),
    updatedAt: item.updated_at ? new Date(item.updated_at).getTime() : undefined,
  }));
}

export async function addSubject(
  userId: string,
  name: string,
  color: string
): Promise<{ data: Subject | null; error: string | null }> {
  const { data, error } = await supabase
    .from('subjects')
    .insert({
      user_id: userId,
      name,
      color,
      total_classes: 0,
      attended_classes: 0,
    })
    .select()
    .single();
  
  if (error || !data) {
    return { data: null, error: error?.message || 'Failed to add subject' };
  }
  
  return {
    data: {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      color: data.color,
      totalClasses: data.total_classes,
      attendedClasses: data.attended_classes,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : undefined,
    },
    error: null,
  };
}

export async function deleteSubject(subjectId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId);
  
  return { error: error ? error.message : null };
}

export async function updateSubjectStats(
  subjectId: string,
  totalClasses: number,
  attendedClasses: number
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('subjects')
    .update({
      total_classes: totalClasses,
      attended_classes: attendedClasses,
    })
    .eq('id', subjectId);
  
  return { error: error ? error.message : null };
}

// Attendance Records
export async function getAttendanceRecords(userId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(item => ({
    id: item.id,
    subjectId: item.subject_id,
    userId: item.user_id,
    date: new Date(item.timestamp).getTime(),
    type: item.type,
  }));
}

export async function logAttendance(
  userId: string,
  subjectId: string,
  type: 'present' | 'bunked'
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('attendance_records')
    .insert({
      user_id: userId,
      subject_id: subjectId,
      type,
    });
  
  return { error: error ? error.message : null };
}

// Settings (stored in user_profiles or local storage)
export async function getSettings(): Promise<AppSettings> {
  // For now, using default. Can extend user_profiles table to store this
  return { targetPercentage: 75 };
}

export async function saveSettings(settings: AppSettings): Promise<{ error: string | null }> {
  // Can be implemented later by extending user_profiles table
  return { error: null };
}

// Reset all user data
export async function resetAllUserData(userId: string): Promise<{ error: string | null }> {
  // Delete all subjects (attendance records will cascade delete)
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('user_id', userId);
  
  return { error: error ? error.message : null };
}
