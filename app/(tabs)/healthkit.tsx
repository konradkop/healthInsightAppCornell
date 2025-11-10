import { CenteredContainer } from "@/components/centered-component";
import { TitleText } from "@/components/title-text";
import { Colors } from "@/constants/theme";

import React, { useState } from "react";
import {
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSharedHealthKit } from "../contexts/healthkit/HealthKitContext";
import { DailyStats } from "../contexts/healthkit/HealthKitContextTypes";

export default function HealthKitDemo() {
  const {
    isAvailable,
    healthData,
    fetchBodyFat,
    fetchHeartRate,
    fetchStepCount,
    fetchActiveEnergy,
    fetchFlightsClimbed,
  } = useSharedHealthKit();

  const [loading, setLoading] = useState(false);

  const useSample =
    !isAvailable || isAvailable === null || Platform.OS !== "ios";

  const { bodyFat, heartRate, stepCount, activeEnergy, flightsClimbed } =
    healthData;

  const handleFetchAll = async () => {
    if (useSample) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchBodyFat(),
        fetchHeartRate(),
        fetchStepCount(),
        fetchActiveEnergy(),
        fetchFlightsClimbed(),
      ]);
    } catch (err) {
      console.error("Error fetching HealthKit data:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderDailyStats = (stats: DailyStats, unit?: string) => (
    <View>
      <Text style={styles.label}>Daily Values:</Text>
      {stats.daily.map((val, idx) => (
        <Text key={idx} style={styles.data}>
          Day {idx + 1}: {val.toFixed(0)} {unit ?? ""}
        </Text>
      ))}
      <Text style={[styles.data, styles.avg]}>
        Average: {stats.avg?.toFixed(0)} {unit ?? ""}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CenteredContainer>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TitleText>HealthKit Demo</TitleText>

          {Platform.OS !== "ios" && (
            <Text style={styles.warning}>
              ⚠️ HealthKit is only available on iOS devices. Showing sample
              data.
            </Text>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.status}>
              HealthKit Available:{" "}
              {isAvailable === null
                ? "Checking..."
                : isAvailable
                ? "✅ Yes"
                : "❌ No (Using Sample Data)"}
            </Text>

            <Button
              title={loading ? "Fetching..." : "Fetch All Data"}
              onPress={handleFetchAll}
              disabled={useSample || loading}
            />

            <View style={styles.section}>
              <Text style={styles.label}>Body Fat Percentage</Text>
              <Text style={styles.data}>{bodyFat.toFixed(2)}%</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Heart Rate</Text>
              {renderDailyStats(heartRate, "bpm")}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Step Count</Text>
              {renderDailyStats(stepCount)}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Active Energy</Text>
              {renderDailyStats(activeEnergy, "kcal")}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Flights Climbed</Text>
              {renderDailyStats(flightsClimbed)}
            </View>
          </View>
        </ScrollView>
      </CenteredContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
    paddingTop: 50,
  },
  content: {
    padding: 24,
    paddingBottom: 50,
    width: "100%",
    alignSelf: "center",
  },
  warning: {
    color: "#d9534f",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: 16,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
  },
  data: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  avg: {
    marginTop: 6,
    fontWeight: "700",
  },
});
