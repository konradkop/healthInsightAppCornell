import {
  CategoryTypeIdentifier,
  CategoryValueSleepAnalysis,
  getMostRecentQuantitySample,
  isHealthDataAvailable,
  QuantityTypeIdentifier,
  queryCategorySamples,
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
  const [sleep, setSleep] = useState<DailyStats>({
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

  const requestCategoryPermission = async (
    identifier: CategoryTypeIdentifier
  ) => {
    if (Platform.OS !== "ios") {
      Alert.alert("Unsupported", "HealthKit is only available on iOS.");
      return false;
    }

    try {
      await requestAuthorization({
        toRead: [identifier], // category types only need read access
        toShare: [],
      });

      return true;
    } catch (err) {
      console.error(
        `Category permission request failed for ${identifier}:`,
        err
      );
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

    // this fetchest the most recent sample (from the function above)
    // the reason i do this is the check if this healthkit info exists on the clients machine
    // if this returns null, we know it doesn't exist and we dip out early
    const validQueryCheckSample = await fetchMostRecent(identifier);
    if (validQueryCheckSample === null) {
      return { daily: Array(7).fill(0), avg: 0 };
    }
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

  // separate funciton then the cumulatvie fetchLast7Days
  const fetchLast7DaysAverage = async (
    identifier: QuantityTypeIdentifier
  ): Promise<DailyStats> => {
    const today = new Date();
    const anchor = new Date(today);
    anchor.setHours(0, 0, 0, 0);

    const valid = await fetchMostRecent(identifier);
    if (valid === null) {
      return { daily: Array(7).fill(0), avg: 0 };
    }

    try {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 6);

      const results = await queryStatisticsCollectionForQuantity(
        identifier,
        ["discreteAverage"],
        anchor,
        { day: 1 },
        {
          filter: {
            startDate: start,
            endDate: today,
          },
        }
      );

      const safeResults = Array.isArray(results) ? results : [];

      const daily = safeResults.map((item) => {
        if (!item || typeof item !== "object") return 0;

        const avgQ = item.averageQuantity;
        if (!avgQ || typeof avgQ.quantity !== "number") return 0;

        const value = avgQ.quantity;
        return Number.isFinite(value) && value >= 0 ? value : 0;
      });

      const avg =
        daily.length > 0 ? daily.reduce((a, b) => a + b, 0) / daily.length : 0;

      return { daily, avg };
    } catch (err) {
      console.error(
        `Error fetching average daily stats for ${identifier}:`,
        err
      );
      Alert.alert(
        `Error fetching average daily stats for ${identifier}`,
        JSON.stringify(err)
      );
      return { daily: Array(7).fill(0), avg: 0 };
    }
  };

  // separate funciton for  the CATEGORY fetchLast7Days
  const fetchLast7DaysCategory = async (
    identifier: CategoryTypeIdentifier
  ): Promise<{ daily: number[]; avg: number }> => {
    const today = new Date();
    const anchor = new Date(today);
    anchor.setHours(0, 0, 0, 0); // today at midnight

    try {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 6); // 7-day window (inclusive)

      const samples = await queryCategorySamples(identifier, {
        filter: { startDate: start, endDate: today },
        ascending: true,
      });

      if (!Array.isArray(samples)) {
        return { daily: Array(7).fill(0), avg: 0 };
      }

      const SLEEP_STAGES = new Set([
        CategoryValueSleepAnalysis.asleepCore,
        CategoryValueSleepAnalysis.asleepDeep,
        CategoryValueSleepAnalysis.asleepREM,
      ]);

      const dailyMinutes = Array(7).fill(0);

      for (const s of samples) {
        if (!s?.startDate || !s?.endDate) continue;
        if (!SLEEP_STAGES.has(s.value)) continue;

        let startDate = new Date(s.startDate);
        let endDate = new Date(s.endDate);

        if (endDate <= startDate) continue;

        // Clamp to window
        if (endDate < start || startDate > today) continue;
        if (startDate < start) startDate = start;
        if (endDate > today) endDate = today;

        // Split interval across days
        let cur = new Date(startDate);

        while (cur < endDate) {
          const dayStart = new Date(cur);
          dayStart.setHours(0, 0, 0, 0);

          const nextDay = new Date(dayStart);
          nextDay.setDate(nextDay.getDate() + 1);

          const segmentEnd = nextDay < endDate ? nextDay : endDate;
          const minutes = (segmentEnd.getTime() - cur.getTime()) / 60000;

          if (minutes > 0) {
            const daysAgo = Math.floor(
              (anchor.getTime() - dayStart.getTime()) / 86400000
            );
            const index = 6 - daysAgo;

            if (index >= 0 && index < 7) {
              dailyMinutes[index] += minutes;
            }
          }

          cur = segmentEnd;
        }
      }

      const dailyHours = dailyMinutes.map((m) => m / 60);
      const avg = dailyHours.reduce((a, b) => a + b, 0) / dailyHours.length;

      return { daily: dailyHours, avg };
    } catch (err) {
      console.error("fetchLast7DaysCategory error:", err);
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
    if (!(await requestPermission("HKQuantityTypeIdentifierRestingHeartRate")))
      return;
    const value = await fetchLast7DaysAverage(
      "HKQuantityTypeIdentifierRestingHeartRate"
    );
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

  const fetchSleep = async () => {
    if (
      !(await requestCategoryPermission(
        "HKCategoryTypeIdentifierSleepAnalysis"
      ))
    )
      return;
    const value = await fetchLast7DaysCategory(
      "HKCategoryTypeIdentifierSleepAnalysis"
    );
    setSleep(value);
  };

  // ===== Expose API =====
  return {
    isAvailable,
    bodyFat,
    heartRate,
    stepCount,
    activeEnergy,
    flightsClimbed,
    sleep,
    fetchBodyFat,
    fetchHeartRate,
    fetchStepCount,
    fetchActiveEnergy,
    fetchFlightsClimbed,
    fetchSleep,
  };
}
