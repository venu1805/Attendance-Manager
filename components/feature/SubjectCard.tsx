import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Subject, SubjectStats } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';

interface SubjectCardProps {
  subject: Subject;
  stats: SubjectStats;
  onPress: () => void;
}

export function SubjectCard({ subject, stats, onPress }: SubjectCardProps) {
  const statusColor = getStatusColor(stats.status);
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        commonStyles.shadow,
        { borderLeftColor: subject.color },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.subjectName} numberOfLines={1}>
            {subject.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.light }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor.main }]} />
            <Text style={[styles.statusText, { color: statusColor.main }]}>
              {stats.status === 'safe' ? 'Safe' : stats.status === 'warning' ? 'At Limit' : 'Critical'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        {/* Current Percentage */}
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: statusColor.main }]}>
            {stats.currentPercentage.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Current</Text>
        </View>

        <View style={styles.divider} />

        {/* Safe to Bunk or Must Attend */}
        {stats.status === 'critical' ? (
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.danger }]}>
              {stats.mustAttend}
            </Text>
            <Text style={styles.statLabel}>Must Attend</Text>
          </View>
        ) : (
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {stats.safeToBunk}
            </Text>
            <Text style={styles.statLabel}>Safe to Bunk</Text>
          </View>
        )}
      </View>

      {/* Classes Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {subject.attendedClasses} / {subject.totalClasses} classes attended
        </Text>
      </View>
    </Pressable>
  );
}

function getStatusColor(status: 'safe' | 'warning' | 'critical') {
  switch (status) {
    case 'safe':
      return { main: colors.success, light: colors.successLight };
    case 'warning':
      return { main: colors.warning, light: colors.warningLight };
    case 'critical':
      return { main: colors.danger, light: colors.dangerLight };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  header: {
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectName: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statBox: {
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
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
