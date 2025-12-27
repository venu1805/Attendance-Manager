import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { useApp } from '@/hooks/useApp';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { userProfile, updateProfile, refreshData } = useApp();
  const { showAlert } = useAlert();
  
  const [fullName, setFullName] = useState('');
  const [usn, setUsn] = useState('');
  const [semester, setSemester] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setUsn(userProfile.usn || '');
      setSemester(userProfile.semester?.toString() || '');
      setCollegeName(userProfile.collegeName || '');
      setMobileNumber(userProfile.mobileNumber || '');
    }
  }, [userProfile]);

  async function handleSave() {
    if (!fullName.trim()) {
      showAlert('Missing Information', 'Please enter your full name');
      return;
    }
    
    if (!usn.trim()) {
      showAlert('Missing Information', 'Please enter your USN/Registration number');
      return;
    }
    
    setSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        usn: usn.trim().toUpperCase(),
        semester: semester ? parseInt(semester, 10) : undefined,
        collegeName: collegeName.trim() || undefined,
        mobileNumber: mobileNumber.trim() || undefined,
      });
      
      await refreshData();
      showAlert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      showAlert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons name="person-circle" size={64} color={colors.primary} />
            <Text style={styles.title}>Student Profile</Text>
            <Text style={styles.subtitle}>
              {user?.email || 'Complete your profile'}
            </Text>
          </View>

          {/* Full Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />

          {/* USN */}
          <Text style={styles.label}>USN / Registration Number *</Text>
          <TextInput
            style={styles.input}
            value={usn}
            onChangeText={setUsn}
            placeholder="e.g., 1AB21CS001"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
          />

          {/* Semester */}
          <Text style={styles.label}>Semester</Text>
          <TextInput
            style={styles.input}
            value={semester}
            onChangeText={setSemester}
            placeholder="e.g., 5"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            maxLength={1}
          />

          {/* College Name */}
          <Text style={styles.label}>College Name</Text>
          <TextInput
            style={styles.input}
            value={collegeName}
            onChangeText={setCollegeName}
            placeholder="Enter your college name"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />

          {/* Mobile Number */}
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="Enter mobile number for alerts"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            maxLength={10}
          />

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && { opacity: 0.7 },
              saving && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Text>
          </Pressable>

          {userProfile && (
            <Pressable
              onPress={() => router.back()}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
  },
  cancelButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
});
