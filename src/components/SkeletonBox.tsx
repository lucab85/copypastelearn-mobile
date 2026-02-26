import { useEffect, useRef } from "react";
import { Animated, type ViewStyle, StyleSheet, View } from "react-native";
import { colors, spacing, radii } from "../theme";

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({
  width = "100%",
  height = 16,
  borderRadius = radii.sm,
  style,
}: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.box,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
      accessibilityLabel="Loading"
    />
  );
}

export function SkeletonCourseCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox height={140} borderRadius={radii.md} />
      <SkeletonBox width="70%" height={18} style={styles.mt12} />
      <SkeletonBox width="90%" height={14} style={styles.mt8} />
      <SkeletonBox width="40%" height={14} style={styles.mt8} />
    </View>
  );
}

export function SkeletonLessonRow() {
  return (
    <View style={styles.row}>
      <SkeletonBox width={28} height={28} borderRadius={14} />
      <View style={styles.rowContent}>
        <SkeletonBox width="60%" height={16} />
        <SkeletonBox width="30%" height={12} style={styles.mt4} />
      </View>
    </View>
  );
}

export function SkeletonDashboard() {
  return (
    <View style={styles.dashboard} accessibilityLabel="Loading dashboard">
      <SkeletonBox width="55%" height={28} />
      <SkeletonBox width="35%" height={16} style={styles.mt8} />
      {/* Stats row */}
      <View style={styles.statsRow}>
        <SkeletonBox width={100} height={72} borderRadius={radii.md} style={{ flex: 1 }} />
        <SkeletonBox width={100} height={72} borderRadius={radii.md} style={{ flex: 1 }} />
        <SkeletonBox width={100} height={72} borderRadius={radii.md} style={{ flex: 1 }} />
      </View>
      {/* Hero card */}
      <SkeletonBox height={160} borderRadius={radii.lg} style={styles.mt12} />
      {/* Section title */}
      <SkeletonBox width="40%" height={20} style={styles.mt20} />
      <SkeletonLessonRow />
      <SkeletonLessonRow />
      <SkeletonLessonRow />
    </View>
  );
}

export function SkeletonCatalog() {
  return (
    <View style={styles.dashboard} accessibilityLabel="Loading catalog">
      <SkeletonBox height={44} borderRadius={radii.md} />
      <View style={styles.chipsRow}>
        <SkeletonBox width={60} height={32} borderRadius={radii.full} />
        <SkeletonBox width={80} height={32} borderRadius={radii.full} />
        <SkeletonBox width={70} height={32} borderRadius={radii.full} />
        <SkeletonBox width={50} height={32} borderRadius={radii.full} />
      </View>
      <SkeletonCourseCard />
      <SkeletonCourseCard />
      <SkeletonCourseCard />
    </View>
  );
}

export function SkeletonCourseDetail() {
  return (
    <View style={styles.dashboard} accessibilityLabel="Loading course">
      <SkeletonBox height={200} borderRadius={radii.lg} />
      <SkeletonBox width="80%" height={24} style={styles.mt12} />
      <SkeletonBox width="50%" height={16} style={styles.mt8} />
      <SkeletonBox width="100%" height={1} style={styles.mt20} />
      <SkeletonLessonRow />
      <SkeletonLessonRow />
      <SkeletonLessonRow />
      <SkeletonLessonRow />
      <SkeletonLessonRow />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.border },
  card: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rowContent: { flex: 1 },
  dashboard: { padding: spacing.md, flex: 1 },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chipsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt20: { marginTop: 20 },
});
