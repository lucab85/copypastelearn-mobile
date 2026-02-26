import { View, StyleSheet, type ViewStyle } from "react-native";
import { colors, radii } from "../theme";

interface ProgressBarProps {
  /** 0-100 */
  progress?: number;
  /** @deprecated use progress */
  percent?: number;
  complete?: boolean;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  percent,
  complete,
  height = 4,
  color,
  style,
}: ProgressBarProps) {
  const value = Math.min(Math.max(progress ?? percent ?? 0, 0), 100);
  const barColor = color ?? (complete || value >= 100 ? colors.success : colors.primary);

  return (
    <View style={[styles.track, { height }, style]}>
      <View
        style={[styles.fill, { width: `${value}%`, backgroundColor: barColor, height }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
    flex: 1,
  },
  fill: {
    borderRadius: 2,
  },
});
