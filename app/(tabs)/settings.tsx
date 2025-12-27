import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/hooks/useApp';
import { useAuth, useAlert } from '@/template';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings, updateSettings, resetAllData, userProfile } = useApp();
  const { showAlert } = useAlert();
  const [targetPercentage, setTargetPercentage] = useState(settings.targetPercentage.toString());

  function handleSavePercentage() {
    const value = parseInt(targetPercentage, 10);
    if (isNaN(value) || value < 0 || value > 100) {
      showAlert('Invalid Percentage', 'Please enter a value between 0 and 100');
      return;
    }
    updateSettings({ targetPercentage: value });
    showAlert('Success', 'Target percentage updated');
  }

  function handleReset() {
    showAlert(
      'Reset All Data?',
      'This will delete all subjects and attendance records. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            setTargetPercentage('75');
            showAlert('Success', 'All data has been reset');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[commonStyles.container, { paddingTop: insets.top }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your preferences</Text>
        </View>

        {/* Profile Section */}
        {userProfile && (
          <View style={[styles.card, commonStyles.shadow]}>
            <Text style={styles.cardTitle}>Profile</Text>
            <View style={styles.profileRow}>
              <Ionicons name="person-circle-outline" size={24} color={colors.textSecondary} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.fullName || 'Complete Profile'}</Text>
                <Text style={styles.profileDetail}>{userProfile.usn || user?.email}</Text>
                {userProfile.semester && (
                  <Text style={styles.profileDetail}>Semester {userProfile.semester}</Text>
                )}
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/profile-setup')}
              style={({ pressed }) => [
                styles.editButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </Pressable>
          </View>
        )}

        {/* Target Percentage */}
        <View style={[styles.card, commonStyles.shadow]}>
          <Text style={styles.cardTitle}>Target Attendance</Text>
          <Text style={styles.cardDescription}>
            Set your minimum required attendance percentage
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={targetPercentage}
              onChangeText={setTargetPercentage}
              keyboardType="number-pad"
              placeholder="75"
              maxLength={3}
            />
            <Text style={styles.inputSuffix}>%</Text>
          </View>
          <Pressable
            onPress={handleSavePercentage}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={[styles.card, commonStyles.shadow]}>
          <Text style={styles.cardTitle}>About BunkSmart</Text>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              BunkSmart helps you make data-driven decisions about class attendance
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              All data is stored locally on your device
            </Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, commonStyles.shadow, styles.dangerCard]}>
          <Text style={[styles.cardTitle, { color: colors.danger }]}>Danger Zone</Text>
          <Text style={styles.cardDescription}>
            Reset all attendance data and subjects. This action cannot be undone.
          </Text>
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={styles.resetButtonText}>Reset All Data</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={async () => {
            const { error } = await logout();
            if (error) {
              showAlert('Error', error);
            }
          }}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: colors.dangerLight,
  },
  cardTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  inputSuffix: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  resetButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.danger,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileDetail: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  editButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
});
