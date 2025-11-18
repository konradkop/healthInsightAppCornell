// hooks/useHealthKit.ts
import {
  getMostRecentQuantitySample,
  isHealthDataAvailable,
  QuantitySample,
  QuantityTypeIdentifier,
  queryQuantitySamples,
  requestAuthorization,
} from "@kingstinct/react-native-healthkit";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

type DailyStats = {
  daily: number[];
  avg: number | null;
};

// 🔹 Device priority filter using source.name
function filterSamplesByDevicePreference(samples: readonly QuantitySample[]) {
  if (!samples?.length) return [];

  const lower = (v?: string) => v?.toLowerCase() ?? "";
  const getName = (s: any) => lower(s.source?.name);

  // Priority: Oura > Apple Watch > iPhone
  const priorities = [
    { key: "oura", match: "oura" },
    { key: "watch", match: "apple watch" },
    { key: "iphone", match: "iphone" },
  ];

  for (const { match } of priorities) {
    const filtered = samples.filter((s) => getName(s).includes(match));
    if (filtered.length > 0) return filtered;
  }

  // fallback — if no recognized sources
  return samples;
}

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
      await requestAuthorization([], [identifier]);
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

  // ===== Fetch last 7 days of samples =====
  const fetchLast7Days = async (identifier: QuantityTypeIdentifier) => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    try {
      const samples = await queryQuantitySamples(identifier, {
        filter: { startDate: sevenDaysAgo, endDate: now },
        ascending: true,
        limit: 7000,
      });

      if (!samples?.length) {
        console.log(`No samples for ${identifier}`);
        return { daily: Array(7).fill(0), avg: 0 };
      }

      // 🔹 Use prioritized device filtering
      const filteredSamples = filterSamplesByDevicePreference(samples);

      Alert.alert(
        `Fetched ${JSON.stringify(filteredSamples)} samples for ${identifier}`
      );

      if (!filteredSamples.length) {
        console.log(`No Oura/Watch/iPhone samples for ${identifier}`);
        return { daily: Array(7).fill(0), avg: 0 };
      }

      // Group by local day
      const dailyMap: Record<string, number> = {};
      filteredSamples.forEach((sample) => {
        const localDay = new Date(sample.startDate).toLocaleDateString("en-US");
        dailyMap[localDay] = (dailyMap[localDay] ?? 0) + sample.quantity;
      });

      // Build 7-day array (fill missing days with 0)
      const daily: number[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);
        const key = d.toLocaleDateString("en-US");
        daily.push(dailyMap[key] ?? 0);
      }

      const avg =
        daily.length > 0
          ? daily.reduce((a, b) => a + b, 0) / daily.length
          : null;

      return { daily, avg };
    } catch (err) {
      console.error(`Error fetching 7-day samples for ${identifier}:`, err);
      Alert.alert(
        `Error fetching 7-day samples for ${identifier}`,
        JSON.stringify(err)
      );
      return { daily: [], avg: null };
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
