// hooks/useHealthKit.ts
import {
  getMostRecentQuantitySample,
  isHealthDataAvailable,
  QuantityTypeIdentifier,
  queryStatisticsCollectionForQuantity,
  QueryStatisticsResponse,
  requestAuthorization,
} from "@kingstinct/react-native-healthkit";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

type DailyStats = {
  daily: number[];
  avg: number | null;
};

const UNITS: Partial<Record<QuantityTypeIdentifier, string>> = {
  HKQuantityTypeIdentifierStepCount: "count",
  HKQuantityTypeIdentifierHeartRate: "count/min",
  HKQuantityTypeIdentifierActiveEnergyBurned: "kcal",
  HKQuantityTypeIdentifierFlightsClimbed: "count",
  HKQuantityTypeIdentifierBodyFatPercentage: "%",
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
    Alert.alert("fetch last 7 days hit");
    const today = new Date();
    const anchor = new Date(today);
    anchor.setHours(0, 0, 0, 0); // anchor date required - midnight

    // this fetchest the most recent sample (from the function above)
    // the reason i do this is the check if this healthkit info exists on the clients machine
    // if this returns null, we know it doesn't exist and we dip out early
    const validQueryCheckSample = await fetchMostRecent(identifier);
    if (validQueryCheckSample === null) {
      Alert.alert("fetch most recent is null, app crashes here");
      return { daily: Array(7).fill(0), avg: 0 };
    }
    Alert.alert("Passes fetch most recent");
    try {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 6);

      const results = await queryStatisticsCollectionForQuantity(
        identifier,
        ["cumulativeSum"],
        anchor,
        { day: 1 },
        {
          unit: UNITS[identifier],
          filter: {
            startDate: start,
            endDate: today,
          },
        }
      );
      Alert.alert(
        `Passes queryStatisticsCollectionForQuantity, results look like: ${JSON.stringify(
          results
        )}`
      );

      const safeResults: readonly QueryStatisticsResponse[] = Array.isArray(
        results
      )
        ? results
        : [];

      const daily: number[] = safeResults.map((item) => {
        if (!item || typeof item !== "object") return 0;

        const sum = item?.sumQuantity;

        if (!sum || typeof sum?.quantity !== "number") return 0;

        const value = sum?.quantity || 0;

        return Number.isFinite(value) && value >= 0 ? value : 0;
      });

      // Compute avg safely
      const avg =
        daily.length > 0 ? daily.reduce((a, b) => a + b, 0) / daily.length : 0;

      return { daily, avg };
    } catch (err) {
      Alert.alert(
        `Error fetching daily stats for ${identifier}:`,
        JSON.stringify(err)
      );
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
    Alert.alert("fetch Step count hit");
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
