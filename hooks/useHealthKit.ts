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
    if (Platform.OS !== "ios")
      return Alert.alert("Unsupported", "HealthKit is only available on iOS.");
    await requestAuthorization([], [identifier]);
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
        sevenDaysAgo.toISOString(),
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
      Alert.alert(`Error fetching 7-day stats for ${identifier}`);
      return { daily: [], avg: null };
    }
  };

  // ===== Body Fat =====
  const requestBodyFatPermission = () =>
    requestPermission("HKQuantityTypeIdentifierBodyFatPercentage");
  const fetchBodyFat = async () =>
    setBodyFat(
      await fetchMostRecent("HKQuantityTypeIdentifierBodyFatPercentage")
    );

  // ===== Heart Rate =====
  const requestHeartRatePermission = () =>
    requestPermission("HKQuantityTypeIdentifierHeartRate");
  const fetchHeartRate = async () =>
    setHeartRate(await fetchLast7Days("HKQuantityTypeIdentifierHeartRate"));

  // ===== Step Count =====
  const requestStepCountPermission = () =>
    requestPermission("HKQuantityTypeIdentifierStepCount");
  const fetchStepCount = async () =>
    setStepCount(await fetchLast7Days("HKQuantityTypeIdentifierStepCount"));

  // ===== Active Energy =====
  const requestActiveEnergyPermission = () =>
    requestPermission("HKQuantityTypeIdentifierActiveEnergyBurned");
  const fetchActiveEnergy = async () =>
    setActiveEnergy(
      await fetchLast7Days("HKQuantityTypeIdentifierActiveEnergyBurned")
    );

  // ===== Flights Climbed =====
  const requestFlightsClimbedPermission = () =>
    requestPermission("HKQuantityTypeIdentifierFlightsClimbed");
  const fetchFlightsClimbed = async () =>
    setFlightsClimbed(
      await fetchLast7Days("HKQuantityTypeIdentifierFlightsClimbed")
    );

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
