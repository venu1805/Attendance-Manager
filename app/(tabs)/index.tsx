import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/hooks/useApp';
import { SubjectCard } from '@/components/feature/SubjectCard';
import { calculateSubjectStats, calculateOverallStats } from '@/services/attendanceService';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { subjects, settings, isLoading } = useApp();

  const overallStats = useMemo(
    () => calculateOverallStats(subjects, settings.targetPercentage),
    [subjects, settings.targetPercentage]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[commonStyles.container, { paddingTop: insets.top }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.container, { paddingTop: insets.top }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>BunkSmart</Text>
            <Text style={styles.subtitle}>Track your attendance smartly</Text>
          </View>
        </View>

        {/* Overall Stats Card */}
        {subjects.length > 0 && (
          <View style={[styles.overallCard, commonStyles.shadow]}>
            <Text style={styles.overallTitle}>Overall Attendance</Text>
            <View style={styles.overallStats}>
              <View style={styles.overallStatItem}>
                <Text style={[styles.overallValue, { color: colors.primary }]}>
                  {overallStats.currentPercentage.toFixed(1)}%
                </Text>
                <Text style={styles.overallLabel}>Current</Text>
              </View>
              <View style={styles.overallDivider} />
              <View style={styles.overallStatItem}>
                <Text style={[styles.overallValue, { color: colors.textSecondary }]}>
                  {settings.targetPercentage}%
                </Text>
                <Text style={styles.overallLabel}>Target</Text>
              </View>
            </View>
          </View>
        )}

        {/* Subjects Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Subjects</Text>
            <Pressable
              onPress={() => router.push('/add-subject')}
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
            >
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          {subjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No subjects yet</Text>
              <Text style={styles.emptyText}>
                Add your first subject to start tracking attendance
              </Text>
              <Pressable
                onPress={() => router.push('/add-subject')}
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.emptyButtonText}>Add Subject</Text>
              </Pressable>
            </View>
          ) : (
            subjects.map(subject => {
              const stats = calculateSubjectStats(subject, settings.targetPercentage);
              return (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  stats={stats}
                  onPress={() => router.push(`/subject/${subject.id}`)}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
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
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  overallCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  overallTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  overallStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  overallValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    marginBottom: 4,
  },
  overallLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  overallDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.primary,
    opacity: 0.2,
    marginHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonPressed: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
  },
});
