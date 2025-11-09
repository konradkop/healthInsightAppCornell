// hooks/useHealthKit.ts
import {
  getMostRecentQuantitySample,
  isHealthDataAvailable,
  requestAuthorization,
} from "@kingstinct/react-native-healthkit";

import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

export function useHealthKit() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [activeEnergy, setActiveEnergy] = useState<number | null>(null);
  const [flightsClimbed, setFlightsClimbed] = useState<number | null>(null);

  // Check if HealthKit is available
  useEffect(() => {
    if (Platform.OS !== "ios") {
      setIsAvailable(false);
      return;
    }

    const checkAvailability = async () => {
      const available = await isHealthDataAvailable();
      setIsAvailable(available);
    };

    checkAvailability();
  }, []);

  // ===== Body Fat =====
  const requestBodyFatPermission = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");
    await requestAuthorization(
      ["HKQuantityTypeIdentifierBodyFatPercentage"],
      ["HKQuantityTypeIdentifierBodyFatPercentage"]
    );
    Alert.alert("Permission granted for Body Fat %");
  };

  const fetchBodyFat = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");
    const sample = await getMostRecentQuantitySample(
      "HKQuantityTypeIdentifierBodyFatPercentage"
    );
    if (sample?.quantity) {
      setBodyFat(sample.quantity);
    } else {
      Alert.alert("No body fat data found");
    }
  };

  // ===== Heart Rate =====
  const requestHeartRatePermission = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");
    await requestAuthorization(
      ["HKQuantityTypeIdentifierHeartRate"],
      ["HKQuantityTypeIdentifierHeartRate"]
    );
    Alert.alert("Permission granted for Heart Rate");
  };

  const fetchHeartRate = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");
    const sample = await getMostRecentQuantitySample(
      "HKQuantityTypeIdentifierHeartRate"
    );
    if (sample?.quantity) {
      setHeartRate(sample.quantity);
    } else {
      Alert.alert("No heart rate data found");
    }
  };

  // ===== Step Count =====
  const requestStepCountPermission = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");
    await requestAuthorization(
      ["HKQuantityTypeIdentifierStepCount"],
      ["HKQuantityTypeIdentifierStepCount"]
    );
    Alert.alert("Permission granted for Step Count");
  };

  const fetchStepCount = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");

    const sample = await getMostRecentQuantitySample(
      "HKQuantityTypeIdentifierStepCount"
    );

    if (sample?.quantity) {
      setStepCount(sample.quantity);
    } else {
      Alert.alert("No step count data found");
    }
  };

  // ===== Active Energy =====
  const requestActiveEnergyPermission = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");
    await requestAuthorization(
      ["HKQuantityTypeIdentifierActiveEnergyBurned"],
      ["HKQuantityTypeIdentifierActiveEnergyBurned"]
    );
    Alert.alert("Permission granted for Active Energy Burned");
  };

  const fetchActiveEnergy = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");

    const sample = await getMostRecentQuantitySample(
      "HKQuantityTypeIdentifierActiveEnergyBurned"
    );

    if (sample?.quantity) {
      setActiveEnergy(sample.quantity);
    } else {
      Alert.alert("No active energy data found");
    }
  };

  // ===== Flights Climbed =====
  const requestFlightsClimbedPermission = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");
    await requestAuthorization(
      ["HKQuantityTypeIdentifierFlightsClimbed"],
      ["HKQuantityTypeIdentifierFlightsClimbed"]
    );
    Alert.alert("Permission granted for Flights Climbed");
  };

  const fetchFlightsClimbed = async () => {
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");

    const sample = await getMostRecentQuantitySample(
      "HKQuantityTypeIdentifierFlightsClimbed"
    );

    if (sample?.quantity) {
      setFlightsClimbed(sample.quantity);
    } else {
      Alert.alert("No flights climbed data found");
    }
  };

  return {
    isAvailable,
    bodyFat,
    heartRate,
    stepCount,
    activeEnergy,
    flightsClimbed,
    requestBodyFatPermission,
    fetchBodyFat,
    requestHeartRatePermission,
    fetchHeartRate,
    requestStepCountPermission,
    fetchStepCount,
    requestActiveEnergyPermission,
    fetchActiveEnergy,
    requestFlightsClimbedPermission,
    fetchFlightsClimbed,
  };
}
