import React from "react";
import { ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";

export default function LoadingScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#4DB6AC" />
    </ThemedView>
  );
}
