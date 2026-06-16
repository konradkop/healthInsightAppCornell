  import { DailyStats } from "@/app/contexts/healthkit/HealthKitContextTypes";
import {
  CategoryTypeIdentifier,
  CategoryValueSleepAnalysis,
  getMostRecentQuantitySample,
  QuantityTypeIdentifier,
  queryCategorySamples,
  queryStatisticsCollectionForQuantity,
  QueryStatisticsResponse,
  requestAuthorization
} from "@kingstinct/react-native-healthkit";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

const SAMPLE_HEART_RATE: DailyStats = {
  daily: Array.from({ length: 7 }).map((_, index) => ({
    value: 58 + index * 2,
    date: new Date(Date.now() - (6 - index) * 86400000).toISOString(),
  })),
  avg: 64,
};
const SAMPLE_SLEEP: DailyStats = {
  daily: Array.from({ length: 7 }).map((_, index) => ({
    value: 6 + index * 0.15,
    date: new Date(Date.now() - (6 - index) * 86400000).toISOString(),
  })),
  avg: 6.9,
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

      // Temporarily bypass HealthKit availability checks and use sample data on iOS.
      setIsAvailable(true);
      // const checkAvailability = async () => {
      //   const available = await isHealthDataAvailable();
      //   setIsAvailable(available);
      // };
      // checkAvailability();
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
              date: {              startDate: start,
              endDate: today,}

            },
          }
        );

        const safeResults: readonly QueryStatisticsResponse[] = Array.isArray(
          results
        )
          ? results
          : [];

        const daily = safeResults.map((item, index) => {
          if (!item || typeof item !== "object") {
            return {
              value: 0,
              date: new Date(anchor.getTime() - (6 - index) * 86400000).toISOString(),
            };
          }

          const sum = item?.sumQuantity;

          if (!sum || typeof sum?.quantity !== "number") {
            return {
              value: 0,
              date: new Date(anchor.getTime() - (6 - index) * 86400000).toISOString(),
            };
          }

          const value = sum?.quantity || 0;
          const finalValue = Number.isFinite(value) && value >= 0 ? value : 0;

          return {
            value: finalValue,
            date: new Date(anchor.getTime() - (6 - index) * 86400000).toISOString(),
          };
        });

        const avg =
          daily.length > 0
            ? daily.reduce((a, b) => a + b.value, 0) / daily.length
            : 0;

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
              date: {
                startDate: start,
                endDate: today,
              },
            },
          }
        );

        const safeResults = Array.isArray(results) ? results : [];

        const daily = safeResults.map((item) => {
          if (!item || typeof item !== "object") {
            return { value: 0, date: new Date().toISOString() };
          }

          const avgQ = item.averageQuantity;
          const value =
            avgQ && typeof avgQ.quantity === "number" && avgQ.quantity >= 0
              ? avgQ.quantity
              : 0;

          return {
            value,
            date: new Date(item.startDate).toISOString(),
          };
        });

        const avg =
          daily.length > 0
            ? daily.reduce((a, b) => a + b.value, 0) / daily.length
            : 0;

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
    ): Promise<DailyStats> => {
      const today = new Date();
      const anchor = new Date(today);
      anchor.setHours(0, 0, 0, 0);

      try {
        const start = new Date(anchor);
        start.setDate(start.getDate() - 6);
        
      const samples = await queryCategorySamples(identifier, {
        limit: 100,
        filter: { date: { startDate: start, endDate: today } },
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

        const MS_PER_DAY = 86400000;

        for (const s of samples) {
          if (!s?.startDate || !s?.endDate) continue;
          if (!SLEEP_STAGES.has(s.value)) continue;

          const startDate = new Date(s.startDate);
          const endDate = new Date(s.endDate);

          if (endDate <= startDate) continue;

          // clamp interval
          const clampedStart = startDate < start ? start : startDate;
          const clampedEnd = endDate > today ? today : endDate;

          if (clampedEnd <= clampedStart) continue;

          // split across days
          let cursor = new Date(clampedStart);

          while (cursor < clampedEnd) {
            const dayStart = new Date(cursor);
            dayStart.setHours(0, 0, 0, 0);

            const nextDay = new Date(dayStart);
            nextDay.setDate(nextDay.getDate() + 1);

            const segmentEnd = clampedEnd < nextDay ? clampedEnd : nextDay;

            const minutes = (segmentEnd.getTime() - cursor.getTime()) / 60000;

            if (minutes > 0) {
              const dayIndex = Math.floor(
                (dayStart.getTime() - anchor.getTime()) / MS_PER_DAY
              );

              const index = 6 + dayIndex; // maps [-6..0] → [0..6]

              if (index >= 0 && index < 7) {
                dailyMinutes[index] += minutes;
              }
            }

            cursor = segmentEnd;
          }
        }

        const daily = dailyMinutes.map((m, i) => {
          const date = new Date(anchor);
          date.setDate(date.getDate() - (6 - i));

          return {
            value: m / 60,
            date: date.toISOString(),
          };
        });

        const avg =
          daily.reduce((sum, d) => sum + d.value, 0) / daily.length;

        return { daily, avg };
      } catch (err) {
        console.error("fetchLast7DaysCategory error:", err);
        return { daily: Array(7).fill(0), avg: 0 };
      }
    };

    // ===== Metric-specific fetchers =====
    const fetchBodyFat = async () => {
      try {
        const hasPermission = await requestPermission(
          "HKQuantityTypeIdentifierBodyFatPercentage"
        );

        if (!hasPermission) {
          Alert.alert("DEBUG", "Permission denied");
          return;
        }

        const value = await fetchMostRecent(
          "HKQuantityTypeIdentifierBodyFatPercentage"
        );

        setBodyFat(value);
      } catch (err) {
        Alert.alert(
          "fetchBodyFat Error",
          err instanceof Error ? err.message : JSON.stringify(err)
        );
      }
    };

const fetchHeartRate = async () => {
  try {
    const hasPermission = await requestPermission(
      "HKQuantityTypeIdentifierRestingHeartRate"
    );

    if (!hasPermission) {
      Alert.alert("DEBUG", "Permission denied");
      return;
    }

    Alert.alert("DEBUG", "Before fetchLast7DaysAverage");

    const value = await fetchLast7DaysAverage(
      "HKQuantityTypeIdentifierRestingHeartRate"
    );

    Alert.alert(
      "fetchHeartRate Result",
      JSON.stringify(value).slice(0, 500)
    );

    // leave commented out initially
    //  setHeartRate(value);

  } catch (err) {
    Alert.alert(
      "fetchHeartRate Error",
      err instanceof Error ? err.message : JSON.stringify(err)
    );
  }
};

const fetchStepCount = async () => {
  try {

    const hasPermission = await requestPermission(
      "HKQuantityTypeIdentifierStepCount"
    );

    if (!hasPermission) {
      Alert.alert("DEBUG", "Permission denied");
      return;
    }

    const value = await fetchLast7Days(
      "HKQuantityTypeIdentifierStepCount"
    );


    setStepCount(value);

  } catch (err) {
    Alert.alert(
      "fetchStepCount Error",
      err instanceof Error ? err.message : JSON.stringify(err)
    );
  }
};



  const fetchActiveEnergy = async () => {
    try {
      const hasPermission = await requestPermission(
        "HKQuantityTypeIdentifierActiveEnergyBurned"
      );

      if (!hasPermission) {
        Alert.alert("DEBUG", "Permission denied");
        return;
      }

      const value = await fetchLast7Days(
        "HKQuantityTypeIdentifierActiveEnergyBurned"
      );

      setActiveEnergy(value);
    } catch (err) {
      Alert.alert(
        "fetchActiveEnergy Error",
        err instanceof Error ? err.message : JSON.stringify(err)
      );
    }
  };

  const fetchFlightsClimbed = async () => {
    try {
      const hasPermission = await requestPermission(
        "HKQuantityTypeIdentifierFlightsClimbed"
      );

      if (!hasPermission) {
        Alert.alert("DEBUG", "Permission denied");
        return;
      }

      const value = await fetchLast7Days(
        "HKQuantityTypeIdentifierFlightsClimbed"
      );

      setFlightsClimbed(value);
    } catch (err) {
      Alert.alert(
        "fetchFlightsClimbed Error",
        err instanceof Error ? err.message : JSON.stringify(err)
      );
    }
  };

    const fetchSleep = async () => {
      // HealthKit temporarily disabled for sleep data. Returning sample values.
      // if (
      //   !(await requestCategoryPermission(
      //     "HKCategoryTypeIdentifierSleepAnalysis"
      //   ))
      // )
      //   return;
      // const value = await fetchLast7DaysCategory(
      //   "HKCategoryTypeIdentifierSleepAnalysis"
      // );
      setSleep(SAMPLE_SLEEP);
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
