import { View, Text, StyleSheet } from "react-native";
import { colors, typography } from "../theme";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
}

export function ProgressRing({
  progress,
  size = 56,
  strokeWidth = 5,
  color = colors.primary,
  bgColor = colors.border,
  showText = true,
}: ProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const innerSize = size - strokeWidth * 2;

  // Use two half-circles with rotation to simulate ring
  const rotation = (clampedProgress / 100) * 360;

  return (
    <View style={[styles.container, { width: size, height: size }]} accessibilityLabel={`${Math.round(clampedProgress)}% complete`}>
      {/* Background ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />

      {/* Progress ring - left half */}
      {clampedProgress > 0 && (
        <View style={[styles.halfContainer, { width: size, height: size }]}>
          <View style={[styles.half, { width: size, height: size }]}>
            <View
              style={[
                styles.halfCircle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                  borderColor: color,
                  borderRightColor: "transparent",
                  borderBottomColor: "transparent",
                  transform: [{ rotate: `${Math.min(rotation, 180) - 45}deg` }],
                },
              ]}
            />
          </View>
          {rotation > 180 && (
            <View style={[styles.half, { width: size, height: size }]}>
              <View
                style={[
                  styles.halfCircle,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderRightColor: "transparent",
                    borderBottomColor: "transparent",
                    transform: [{ rotate: `${rotation - 180 - 45}deg` }],
                  },
                ]}
              />
            </View>
          )}
        </View>
      )}

      {/* Center text */}
      {showText && (
        <View style={[styles.center, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
          <Text style={[styles.text, clampedProgress === 100 && styles.textDone]}>
            {clampedProgress === 100 ? "✓" : `${Math.round(clampedProgress)}%`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative", justifyContent: "center", alignItems: "center" },
  ring: { position: "absolute" },
  halfContainer: { position: "absolute", overflow: "hidden" },
  half: { position: "absolute", overflow: "hidden" },
  halfCircle: { position: "absolute" },
  center: {
    position: "absolute",
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { ...typography.caption, color: colors.textSecondary },
  textDone: { color: colors.success, fontSize: 16, fontWeight: "700" },
});
