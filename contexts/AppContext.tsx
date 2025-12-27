import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Subject, AttendanceRecord, AppSettings, UserProfile } from '@/types';
import { useAuth } from '@/template';
import * as supabaseService from '@/services/supabaseService';

interface AppContextType {
  subjects: Subject[];
  records: AttendanceRecord[];
  settings: AppSettings;
  userProfile: UserProfile | null;
  isLoading: boolean;
  addSubject: (name: string, color: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  logAttendance: (subjectId: string, type: 'present' | 'bunked') => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateProfile: (profile: Partial<Omit<UserProfile, 'id' | 'email'>>) => Promise<void>;
  resetAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ targetPercentage: 75 });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Clear data when logged out
      setSubjects([]);
      setRecords([]);
      setSettings({ targetPercentage: 75 });
      setUserProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  async function loadData() {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [loadedSubjects, loadedRecords, loadedSettings, profile] = await Promise.all([
        supabaseService.getSubjects(user.id),
        supabaseService.getAttendanceRecords(user.id),
        supabaseService.getSettings(),
        supabaseService.getUserProfile(user.id),
      ]);
      setSubjects(loadedSubjects);
      setRecords(loadedRecords);
      setSettings(loadedSettings);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshData() {
    await loadData();
  }

  async function addSubject(name: string, color: string) {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabaseService.addSubject(user.id, name, color);
    if (error) throw new Error(error);
    if (data) {
      setSubjects(prev => [data, ...prev]);
    }
  }

  async function deleteSubject(id: string) {
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabaseService.deleteSubject(id);
    if (error) throw new Error(error);
    
    setSubjects(prev => prev.filter(s => s.id !== id));
    setRecords(prev => prev.filter(r => r.subjectId !== id));
  }

  async function logAttendance(subjectId: string, type: 'present' | 'bunked') {
    if (!user) throw new Error('User not authenticated');
    
    // Find subject
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) throw new Error('Subject not found');
    
    // Update subject counts
    const newTotalClasses = subject.totalClasses + 1;
    const newAttendedClasses = type === 'present' 
      ? subject.attendedClasses + 1 
      : subject.attendedClasses;
    
    // Log attendance record
    const { error: logError } = await supabaseService.logAttendance(user.id, subjectId, type);
    if (logError) throw new Error(logError);
    
    // Update subject stats
    const { error: updateError } = await supabaseService.updateSubjectStats(
      subjectId,
      newTotalClasses,
      newAttendedClasses
    );
    if (updateError) throw new Error(updateError);
    
    // Update local state
    setSubjects(prev => prev.map(s => 
      s.id === subjectId 
        ? { ...s, totalClasses: newTotalClasses, attendedClasses: newAttendedClasses }
        : s
    ));
    
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      subjectId,
      userId: user.id,
      date: Date.now(),
      type,
    };
    setRecords(prev => [newRecord, ...prev]);
  }

  async function updateSettings(newSettings: Partial<AppSettings>) {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await supabaseService.saveSettings(updated);
  }

  async function updateProfile(profile: Partial<Omit<UserProfile, 'id' | 'email'>>) {
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabaseService.updateUserProfile(user.id, profile);
    if (error) throw new Error(error);
    
    setUserProfile(prev => prev ? { ...prev, ...profile } : null);
  }

  async function resetAllData() {
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabaseService.resetAllUserData(user.id);
    if (error) throw new Error(error);
    
    setSubjects([]);
    setRecords([]);
  }

  return (
    <AppContext.Provider
      value={{
        subjects,
        records,
        settings,
        userProfile,
        isLoading,
        addSubject,
        deleteSubject,
        logAttendance,
        updateSettings,
        updateProfile,
        resetAllData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
