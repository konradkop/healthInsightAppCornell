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

  // ===== Check HealthKit availability =====
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

  // ===== Request permissions =====
  const requestPermission = async (identifier: QuantityTypeIdentifier) => {
    if (Platform.OS !== "ios") {
      Alert.alert("Unsupported", "HealthKit is only available on iOS.");
      return false;
    }

    try {
      await requestAuthorization({
        toRead: [identifier],
        toShare: [],
      });
      return true;
    } catch (err) {
      console.error(`Permission request failed for ${identifier}:`, err);
      Alert.alert(`Permission request failed for ${identifier}`);
      return false;
    }
  };

  // ===== Fetch most recent sample =====
  const fetchMostRecent = async (identifier: QuantityTypeIdentifier) => {
    const sample = await getMostRecentQuantitySample(identifier);
    return sample?.quantity ?? null;
  };

  const fetchLast7Days = async (identifier: QuantityTypeIdentifier) => {
    const today = new Date();
    const anchor = new Date(today);
    anchor.setHours(0, 0, 0, 0); // anchor date required - midnight

    // Interval of 1 day
    const intervalComponents = { day: 1 };

    // this fetchest the most recent sample (from the function above)
    // the reason i do this is the check if this healthkit info exists on the clients machine
    // if this returns null, we know it doesn't exist and we dip out early
    const validQueryCheckSample = await fetchMostRecent(identifier);
    if (!validQueryCheckSample) {
      return { daily: Array(7).fill(0), avg: 0 };
    }

    try {
      const results = await queryStatisticsCollectionForQuantity(
        identifier,
        ["cumulativeSum"],
        anchor,
        intervalComponents,
        {
          filter: {
            startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            endDate: today,
          },
        }
      );

      // Results is an array: QueryStatisticsResponse[]
      const daily: number[] = results.map(
        (item) => item?.sumQuantity?.quantity ?? 0
      );

      const avg =
        daily.length > 0 ? daily.reduce((a, b) => a + b, 0) / daily.length : 0;

      return { daily, avg };
    } catch (err) {
      console.error(`Error fetching daily stats for ${identifier}:`, err);
      return { daily: Array(7).fill(0), avg: 0 };
    }
  };

  // ===== Metric-specific fetchers =====
  const fetchBodyFat = async () => {
    if (!(await requestPermission("HKQuantityTypeIdentifierBodyFatPercentage")))
      return;
    const value = await fetchMostRecent(
      "HKQuantityTypeIdentifierBodyFatPercentage"
    );
    setBodyFat(value);
  };

  const fetchHeartRate = async () => {
    if (!(await requestPermission("HKQuantityTypeIdentifierHeartRate"))) return;
    const value = await fetchLast7Days("HKQuantityTypeIdentifierHeartRate");
    setHeartRate(value);
  };

  const fetchStepCount = async () => {
    if (!(await requestPermission("HKQuantityTypeIdentifierStepCount"))) return;
    const value = await fetchLast7Days("HKQuantityTypeIdentifierStepCount");
    setStepCount(value);
  };

  const fetchActiveEnergy = async () => {
    if (
      !(await requestPermission("HKQuantityTypeIdentifierActiveEnergyBurned"))
    )
      return;
    const value = await fetchLast7Days(
      "HKQuantityTypeIdentifierActiveEnergyBurned"
    );
    setActiveEnergy(value);
  };

  const fetchFlightsClimbed = async () => {
    if (!(await requestPermission("HKQuantityTypeIdentifierFlightsClimbed")))
      return;
    const value = await fetchLast7Days(
      "HKQuantityTypeIdentifierFlightsClimbed"
    );
    setFlightsClimbed(value);
  };

  // ===== Expose API =====
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
