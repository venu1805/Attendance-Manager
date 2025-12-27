import { Subject, SubjectStats } from '@/types';

/**
 * Calculate attendance statistics for a subject
 */
export function calculateSubjectStats(
  subject: Subject,
  targetPercentage: number
): SubjectStats {
  const { totalClasses, attendedClasses } = subject;
  
  // Calculate current percentage
  const currentPercentage = totalClasses > 0 
    ? (attendedClasses / totalClasses) * 100 
    : 100;
  
  // Determine status
  let status: 'safe' | 'warning' | 'critical';
  if (currentPercentage > targetPercentage) {
    status = 'safe';
  } else if (currentPercentage === targetPercentage) {
    status = 'warning';
  } else {
    status = 'critical';
  }
  
  // Calculate "Safe to Bunk" count
  let safeToBunk = 0;
  if (currentPercentage >= targetPercentage && totalClasses > 0) {
    // Formula: floor((Attended / TargetPercentage) - TotalClasses)
    const maxAllowedAbsences = Math.floor((attendedClasses / (targetPercentage / 100)) - totalClasses);
    safeToBunk = Math.max(0, maxAllowedAbsences);
  }
  
  // Calculate "Must Attend" count
  let mustAttend = 0;
  if (currentPercentage < targetPercentage && totalClasses > 0) {
    // Formula: ceil(((TargetPercentage × TotalClasses) - AttendedClasses) / (1 - TargetPercentage/100))
    const requiredAttendance = ((targetPercentage / 100) * totalClasses) - attendedClasses;
    const denominator = 1 - (targetPercentage / 100);
    mustAttend = Math.ceil(requiredAttendance / denominator);
  }
  
  return {
    currentPercentage: Math.round(currentPercentage * 100) / 100,
    safeToBunk,
    mustAttend,
    status,
  };
}

/**
 * Calculate overall attendance across all subjects
 */
export function calculateOverallStats(
  subjects: Subject[],
  targetPercentage: number
): SubjectStats {
  if (subjects.length === 0) {
    return {
      currentPercentage: 100,
      safeToBunk: 0,
      mustAttend: 0,
      status: 'safe',
    };
  }
  
  const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
  
  const virtualSubject: Subject = {
    id: 'overall',
    name: 'Overall',
    color: '#6366F1',
    totalClasses,
    attendedClasses: totalAttended,
    createdAt: Date.now(),
  };
  
  return calculateSubjectStats(virtualSubject, targetPercentage);
}
