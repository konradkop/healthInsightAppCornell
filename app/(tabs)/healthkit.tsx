import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useHealthKit } from "../../hooks/useHealthKit";

export default function HealthKit() {
  const {
    isAvailable = false,
    isAuthorized = false,
    stepCount = 0,
    heartRate = 0,
    error,
  } = useHealthKit();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? "#000" : "#fff",
    },
    text: {
      color: isDark ? "#fff" : "#000",
      fontSize: 16,
      marginBottom: 8,
    },
    errorText: {
      color: isDark ? "#ff7b7b" : "#cc0000",
      fontSize: 16,
      marginBottom: 8,
    },
  });

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>
        HealthKit Available: {isAvailable ? "Yes" : "No"}
      </ThemedText>
      <ThemedText style={styles.text}>
        HealthKit Authorized: {isAuthorized ? "Yes" : "No"}
      </ThemedText>
      <ThemedText style={styles.text}>
        Today&apos;s Steps: {stepCount ?? "Loading..."}
      </ThemedText>
      <ThemedText style={styles.text}>
        Latest Heart Rate: {heartRate ?? "Loading..."}
      </ThemedText>
    </ThemedView>
  );
}
