import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/hooks/useApp';
import { useAlert } from '@/template';
import { calculateSubjectStats } from '@/services/attendanceService';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { subjects, settings, logAttendance, deleteSubject } = useApp();
  const { showAlert } = useAlert();
  const [isLogging, setIsLogging] = useState(false);

  const subject = subjects.find(s => s.id === id);
  const stats = useMemo(
    () => subject ? calculateSubjectStats(subject, settings.targetPercentage) : null,
    [subject, settings.targetPercentage]
  );

  if (!subject || !stats) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Subject not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  async function handleLogAttendance(type: 'present' | 'bunked') {
    if (isLogging) return;
    
    setIsLogging(true);
    try {
      await logAttendance(subject.id, type);
      showAlert(
        'Logged',
        `Marked as ${type === 'present' ? 'Present' : 'Bunked'}`
      );
    } catch (error) {
      showAlert('Error', 'Failed to log attendance');
    } finally {
      setIsLogging(false);
    }
  }

  function handleDelete() {
    showAlert(
      'Delete Subject?',
      `This will permanently delete "${subject.name}" and all its attendance records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSubject(subject.id);
            router.back();
          },
        },
      ]
    );
  }

  const statusColor = stats.status === 'safe' ? colors.success :
                      stats.status === 'warning' ? colors.warning :
                      colors.danger;

  return (
    <SafeAreaView style={commonStyles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subject Header */}
        <View style={[styles.header, { borderLeftColor: subject.color }]}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {stats.status === 'safe' ? 'Safe' : 
               stats.status === 'warning' ? 'At Limit' : 
               'Critical'}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={[styles.statsCard, commonStyles.shadow]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: statusColor }]}>
                {stats.currentPercentage.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>Current Attendance</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                {settings.targetPercentage}%
              </Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
          </View>
        </View>

        {/* Smart Counters */}
        <View style={styles.countersRow}>
          {stats.status === 'critical' ? (
            <View style={[styles.counterCard, commonStyles.shadow, { backgroundColor: colors.dangerLight }]}>
              <Ionicons name="alert-circle" size={32} color={colors.danger} />
              <Text style={[styles.counterValue, { color: colors.danger }]}>
                {stats.mustAttend}
              </Text>
              <Text style={[styles.counterLabel, { color: colors.danger }]}>
                Classes to Attend
              </Text>
              <Text style={styles.counterDescription}>
                to reach {settings.targetPercentage}%
              </Text>
            </View>
          ) : (
            <View style={[styles.counterCard, commonStyles.shadow, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              <Text style={[styles.counterValue, { color: colors.success }]}>
                {stats.safeToBunk}
              </Text>
              <Text style={[styles.counterLabel, { color: colors.success }]}>
                Safe to Bunk
              </Text>
              <Text style={styles.counterDescription}>
                while staying above {settings.targetPercentage}%
              </Text>
            </View>
          )}
        </View>

        {/* Attendance Summary */}
        <View style={[styles.card, commonStyles.shadow]}>
          <Text style={styles.cardTitle}>Attendance Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Classes</Text>
            <Text style={styles.summaryValue}>{subject.totalClasses}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Attended</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {subject.attendedClasses}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bunked</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              {subject.totalClasses - subject.attendedClasses}
            </Text>
          </View>
        </View>

        {/* Log Attendance Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Log Attendance</Text>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => handleLogAttendance('present')}
              disabled={isLogging}
              style={({ pressed }) => [
                styles.logButton,
                styles.presentButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                isLogging && { opacity: 0.5 },
              ]}
            >
              <Ionicons name="checkmark-circle" size={40} color="#FFFFFF" />
              <Text style={styles.logButtonText}>Present</Text>
            </Pressable>

            <Pressable
              onPress={() => handleLogAttendance('bunked')}
              disabled={isLogging}
              style={({ pressed }) => [
                styles.logButton,
                styles.bunkedButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                isLogging && { opacity: 0.5 },
              ]}
            >
              <Ionicons name="close-circle" size={40} color="#FFFFFF" />
              <Text style={styles.logButtonText}>Bunked</Text>
            </Pressable>
          </View>
        </View>

        {/* Delete Button */}
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Delete Subject</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    ...commonStyles.shadow,
  },
  subjectName: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  countersRow: {
    marginBottom: spacing.lg,
  },
  counterCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 48,
    fontWeight: typography.bold,
    marginVertical: spacing.sm,
  },
  counterLabel: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    marginBottom: 4,
  },
  counterDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  actionSection: {
    marginBottom: spacing.lg,
  },
  actionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  logButton: {
    flex: 1,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...commonStyles.shadow,
  },
  presentButton: {
    backgroundColor: colors.success,
  },
  bunkedButton: {
    backgroundColor: colors.danger,
  },
  logButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  deleteButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.danger,
  },
});
