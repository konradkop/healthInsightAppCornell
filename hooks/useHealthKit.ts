// hooks/useHealthKit.ts
import {
  getMostRecentQuantitySample,
  isHealthDataAvailable,
  QuantityTypeIdentifier,
  queryStatisticsCollectionForQuantity,
  requestAuthorization,
} from "@kingstinct/react-native-healthkit";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

type DailyStats = {
  daily: number[];
  avg: number | null;
};

export function useHealthKit() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [heartRate, setHeartRate] = useState<DailyStats>({
    daily: [],
    avg: null,
  });
  const [stepCount, setStepCount] = useState<DailyStats>({
    daily: [],
    avg: null,
  });
  const [activeEnergy, setActiveEnergy] = useState<DailyStats>({
    daily: [],
    avg: null,
  });
  const [flightsClimbed, setFlightsClimbed] = useState<DailyStats>({
    daily: [],
    avg: null,
  });

  // Check HealthKit availability
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

  // Generic permission requester
  const requestPermission = async (identifier: QuantityTypeIdentifier) => {
    if (Platform.OS !== "ios") {
      Alert.alert("Unsupported", "HealthKit is only available on iOS.");
      return false;
    }
    try {
      await requestAuthorization([], [identifier]);
      return true;
    } catch (err) {
      console.error(`Permission request failed for ${identifier}:`, err);
      Alert.alert(`Permission request failed for ${identifier}`);
      return false;
    }
  };

  // Generic fetcher for most recent
  const fetchMostRecent = async (identifier: QuantityTypeIdentifier) => {
    const sample = await getMostRecentQuantitySample(identifier);
    return sample?.quantity ?? null;
  };

  // Generic fetcher for last 7 days + average
  const fetchLast7Days = async (identifier: QuantityTypeIdentifier) => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    try {
      const stats = await queryStatisticsCollectionForQuantity(
        identifier,
        ["cumulativeSum"],
        sevenDaysAgo.toISOString().slice(0, 10),
        { day: 1 }
      );

      const daily = stats.map((stat) => stat.sumQuantity?.quantity ?? 0);
      const avg =
        daily.length > 0
          ? daily.reduce((sum, val) => sum + val, 0) / daily.length
          : null;

      return { daily, avg };
    } catch (err) {
      console.error(`Error fetching 7-day stats for ${identifier}:`, err);
      Alert.alert(
        `Error fetching 7-day stats for ${identifier}`,
        JSON.stringify(err)
      );
      return { daily: [], avg: null };
    }
  };

  // ===== Body Fat =====
  const fetchBodyFat = async () => {
    const granted = await requestPermission(
      "HKQuantityTypeIdentifierBodyFatPercentage"
    );
    if (!granted) return;
    const value = await fetchMostRecent(
      "HKQuantityTypeIdentifierBodyFatPercentage"
    );
    setBodyFat(value);
  };

  // ===== Heart Rate =====
  const fetchHeartRate = async () => {
    const granted = await requestPermission(
      "HKQuantityTypeIdentifierHeartRate"
    );
    if (!granted) return;
    const value = await fetchLast7Days("HKQuantityTypeIdentifierHeartRate");
    setHeartRate(value);
  };

  // ===== Step Count =====
  const fetchStepCount = async () => {
    const granted = await requestPermission(
      "HKQuantityTypeIdentifierStepCount"
    );
    if (!granted) return;
    const value = await fetchLast7Days("HKQuantityTypeIdentifierStepCount");
    setStepCount(value);
  };

  // ===== Active Energy =====
  const fetchActiveEnergy = async () => {
    const granted = await requestPermission(
      "HKQuantityTypeIdentifierActiveEnergyBurned"
    );
    if (!granted) return;
    const value = await fetchLast7Days(
      "HKQuantityTypeIdentifierActiveEnergyBurned"
    );
    setActiveEnergy(value);
  };

  // ===== Flights Climbed =====
  const fetchFlightsClimbed = async () => {
    const granted = await requestPermission(
      "HKQuantityTypeIdentifierFlightsClimbed"
    );
    if (!granted) return;
    const value = await fetchLast7Days(
      "HKQuantityTypeIdentifierFlightsClimbed"
    );
    setFlightsClimbed(value);
  };

  return {
    isAvailable,
    bodyFat,
    heartRate,
    stepCount,
    activeEnergy,
    flightsClimbed,
    fetchBodyFat,
    fetchHeartRate,
    fetchStepCount,
    fetchActiveEnergy,
    fetchFlightsClimbed,
  };
}
