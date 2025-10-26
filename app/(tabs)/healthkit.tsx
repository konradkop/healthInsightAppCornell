// screens/HealthKitDemo.tsx
import React from "react";
import {
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useHealthKit } from "../../hooks/useHealthKit";

export default function HealthKitDemo() {
  const {
    isAvailable,
    bodyFat,
    heartRate,
    requestBodyFatPermission,
    fetchBodyFat,
    requestHeartRatePermission,
    fetchHeartRate,
    requestStepCountPermission,
    fetchStepCount,
    stepCount,
    requestActiveEnergyPermission,
    fetchActiveEnergy,
    activeEnergy,
    flightsClimbed,
    requestFlightsClimbedPermission,
    fetchFlightsClimbed,
  } = useHealthKit();

  if (Platform.OS !== "ios") {
    return (
      <View style={styles.nonIosContainer}>
        <Text style={styles.nonIosText}>
          🚫 HealthKit is only available on iOS devices.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>HealthKit Demo</Text>

      <Text style={styles.status}>
        HealthKit Available:{" "}
        {isAvailable === null
          ? "Checking..."
          : isAvailable
          ? "✅ Yes"
          : "❌ No"}
      </Text>

      <View style={styles.section}>
        <Text style={styles.title}>Body Fat Percentage</Text>
        <Button title="Request Permission" onPress={requestBodyFatPermission} />
        <Button title="Fetch Latest" onPress={fetchBodyFat} />
        {bodyFat !== null && (
          <Text style={styles.data}>Body Fat: {bodyFat.toFixed(2)}%</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Heart Rate</Text>
        <Button
          title="Request Permission"
          onPress={requestHeartRatePermission}
        />
        <Button title="Fetch Latest" onPress={fetchHeartRate} />
        {heartRate !== null && (
          <Text style={styles.data}>
            Heart Rate: {heartRate.toFixed(0)} bpm
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Step Count</Text>
        <Button
          title="Request Permission"
          onPress={requestStepCountPermission}
        />
        <Button title="Fetch Latest" onPress={fetchStepCount} />
        {stepCount !== null && (
          <Text style={styles.data}>Steps: {stepCount.toFixed(0)}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Active Energy</Text>
        <Button
          title="Grant Calories Permission"
          onPress={requestActiveEnergyPermission}
        />
        <Button title="Fetch Active Energy" onPress={fetchActiveEnergy} />
        <Text>Active Energy: {activeEnergy ?? "N/A"} kcal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Flights Climbed</Text>
        <Button
          title="Grant Flights Permission"
          onPress={requestFlightsClimbedPermission}
        />
        <Button title="Fetch Flights Climbed" onPress={fetchFlightsClimbed} />
        <Text>Flights Climbed: {flightsClimbed ?? "N/A"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  nonIosContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  nonIosText: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    marginHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 30,
  },
  section: {
    width: "100%",
    marginBottom: 30,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "600",
  },
  data: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
