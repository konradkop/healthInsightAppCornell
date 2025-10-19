import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useHealthKit } from "../../hooks/useHealthKit";

export default function HealthKit() {
  const {
    isAvailable = false,
    isAuthorized = false,
    stepCount = 0,
    heartRate = 0,
    error,
    triggerAuthorization,
  } = useHealthKit();

  // Local click log: each entry is a timestamped string
  const [clickLog, setClickLog] = useState<string[]>([]);

  // Handler that records the click and calls the hook trigger
  const handleConnectPress = () => {
    const entry = `${new Date().toLocaleString()} — Connect pressed`;
    setClickLog((prev) => [entry, ...prev]); // most-recent-first
    if (triggerAuthorization) {
      try {
        triggerAuthorization();
      } catch (e) {
        const errEntry = `${new Date().toLocaleString()} — triggerAuthorization threw: ${String(
          e
        )}`;
        setClickLog((prev) => [errEntry, ...prev]);
      }
    } else {
      const missingEntry = `${new Date().toLocaleString()} — triggerAuthorization not available`;
      setClickLog((prev) => [missingEntry, ...prev]);
    }
  };

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
    buttonWrap: {
      marginTop: 16,
      alignSelf: "flex-start",
    },
    logContainer: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#eee",
      paddingTop: 12,
    },
    logItem: {
      color: isDark ? "#ddd" : "#333",
      fontSize: 14,
      marginBottom: 6,
    },
  });

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {String(error)}</Text>
        <View style={styles.buttonWrap}>
          <Button
            title={
              isAuthorized ? "Re-request Authorization" : "Connect to Health"
            }
            onPress={handleConnectPress}
          />
        </View>

        <View style={styles.logContainer}>
          <ThemedText style={styles.text}>Connect button history:</ThemedText>
          <ScrollView>
            {clickLog.length === 0 ? (
              <ThemedText style={styles.logItem}>No attempts yet</ThemedText>
            ) : (
              clickLog.map((entry, idx) => (
                <ThemedText key={`${entry}-${idx}`} style={styles.logItem}>
                  {entry}
                </ThemedText>
              ))
            )}
          </ScrollView>
        </View>
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

      <View style={styles.buttonWrap}>
        <Button
          title={
            isAuthorized ? "Re-request Authorization" : "Connect to Health"
          }
          onPress={handleConnectPress}
        />
      </View>

      <View style={styles.logContainer}>
        <ThemedText style={styles.text}>Connect button history:</ThemedText>
        <ScrollView>
          {clickLog.length === 0 ? (
            <ThemedText style={styles.logItem}>No attempts yet</ThemedText>
          ) : (
            clickLog.map((entry, idx) => (
              <ThemedText key={`${entry}-${idx}`} style={styles.logItem}>
                {entry}
              </ThemedText>
            ))
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}
