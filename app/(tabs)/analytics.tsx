import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { calculateSubjectStats } from '@/services/attendanceService';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { subjects, records, settings } = useApp();

  const analytics = useMemo(() => {
    const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
    const totalBunked = totalClasses - totalAttended;

    const safeSubjects = subjects.filter(s => {
      const stats = calculateSubjectStats(s, settings.targetPercentage);
      return stats.status === 'safe';
    }).length;

    const criticalSubjects = subjects.filter(s => {
      const stats = calculateSubjectStats(s, settings.targetPercentage);
      return stats.status === 'critical';
    }).length;

    return {
      totalClasses,
      totalAttended,
      totalBunked,
      safeSubjects,
      criticalSubjects,
      attendanceRate: totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0,
    };
  }, [subjects, settings.targetPercentage]);

  return (
    <SafeAreaView style={[commonStyles.container, { paddingTop: insets.top }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your attendance insights</Text>
        </View>

        {subjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No data yet. Add subjects and log attendance to see analytics.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, commonStyles.shadow, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {analytics.totalClasses}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.primary }]}>
                  Total Classes
                </Text>
              </View>

              <View style={[styles.summaryCard, commonStyles.shadow, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  {analytics.totalAttended}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.success }]}>
                  Attended
                </Text>
              </View>

              <View style={[styles.summaryCard, commonStyles.shadow, { backgroundColor: colors.dangerLight }]}>
                <Text style={[styles.summaryValue, { color: colors.danger }]}>
                  {analytics.totalBunked}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.danger }]}>
                  Bunked
                </Text>
              </View>

              <View style={[styles.summaryCard, commonStyles.shadow, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>
                  {analytics.attendanceRate.toFixed(1)}%
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.warning }]}>
                  Rate
                </Text>
              </View>
            </View>

            {/* Subject Status */}
            <View style={[styles.card, commonStyles.shadow]}>
              <Text style={styles.cardTitle}>Subject Status</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.statusLabel}>Safe Subjects</Text>
                  <Text style={styles.statusValue}>{analytics.safeSubjects}</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: colors.danger }]} />
                  <Text style={styles.statusLabel}>Critical Subjects</Text>
                  <Text style={styles.statusValue}>{analytics.criticalSubjects}</Text>
                </View>
              </View>
            </View>

            {/* Subject Breakdown */}
            <View style={[styles.card, commonStyles.shadow]}>
              <Text style={styles.cardTitle}>Subject Breakdown</Text>
              {subjects.map(subject => {
                const stats = calculateSubjectStats(subject, settings.targetPercentage);
                return (
                  <View key={subject.id} style={styles.subjectRow}>
                    <View style={[styles.subjectDot, { backgroundColor: subject.color }]} />
                    <Text style={styles.subjectName} numberOfLines={1}>
                      {subject.name}
                    </Text>
                    <Text style={[styles.subjectPercent, { 
                      color: stats.status === 'safe' ? colors.success : 
                             stats.status === 'warning' ? colors.warning : 
                             colors.danger 
                    }]}>
                      {stats.currentPercentage.toFixed(1)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: '50%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.sm,
    flex: 0,
    flexBasis: `calc(50% - ${spacing.md}px)`,
  },
  summaryValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statusItem: {
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  subjectName: {
    flex: 1,
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  subjectPercent: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
});
