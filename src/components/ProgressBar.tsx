import { View, StyleSheet } from "react-native";

interface ProgressBarProps {
  percent: number;
  complete?: boolean;
  height?: number;
}

export function ProgressBar({ percent, complete, height = 4 }: ProgressBarProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const color = complete || clampedPercent >= 100 ? "#16a34a" : "#2563eb";

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[styles.fill, { width: `${clampedPercent}%`, backgroundColor: color, height }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    borderRadius: 2,
  },
});
