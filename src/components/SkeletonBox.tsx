import { useEffect, useRef } from "react";
import { Animated, type ViewStyle, StyleSheet } from "react-native";

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({
  width = "100%",
  height = 16,
  borderRadius = 4,
  style,
}: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
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
    />
  );
}

export function SkeletonCourseCard() {
  return (
    <Animated.View style={styles.card}>
      <SkeletonBox height={140} borderRadius={12} />
      <SkeletonBox width="70%" height={18} style={styles.mt12} />
      <SkeletonBox width="90%" height={14} style={styles.mt8} />
      <SkeletonBox width="40%" height={14} style={styles.mt8} />
    </Animated.View>
  );
}

export function SkeletonLessonRow() {
  return (
    <Animated.View style={styles.row}>
      <SkeletonBox width={24} height={24} borderRadius={12} />
      <Animated.View style={styles.rowContent}>
        <SkeletonBox width="60%" height={16} />
        <SkeletonBox width="30%" height={12} style={styles.mt4} />
      </Animated.View>
    </Animated.View>
  );
}

export function SkeletonDashboard() {
  return (
    <Animated.View style={styles.dashboard}>
      <SkeletonBox width="50%" height={24} />
      <SkeletonBox width="30%" height={14} style={styles.mt12} />
      <SkeletonCourseCard />
      <SkeletonCourseCard />
      <SkeletonBox width="40%" height={18} style={styles.mt12} />
      <SkeletonLessonRow />
      <SkeletonLessonRow />
      <SkeletonLessonRow />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#e5e7eb" },
  card: { marginBottom: 16, padding: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowContent: { flex: 1 },
  dashboard: { padding: 16 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
});
