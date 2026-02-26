import { Stack } from "expo-router";

export default function CatalogLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Courses" }} />
      <Stack.Screen name="[slug]" options={{ title: "Course" }} />
    </Stack>
  );
}
