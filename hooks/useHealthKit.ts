// hooks/useHealthKit.ts
import {
  getMostRecentQuantitySample,
  isHealthDataAvailable,
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

  const fetchLast7Days = async (identifier: QuantityTypeIdentifier) => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    try {
      const samples = await queryQuantitySamples(identifier, {
        filter: {
          startDate: sevenDaysAgo,
          endDate: now,
        },
        ascending: true,
      });

      if (!samples?.length) {
        console.log(`No samples for ${identifier}`);
        return { daily: Array(7).fill(0), avg: 0 };
      }

      const dailyMap: Record<string, number> = {};
      samples.forEach((sample) => {
        const localDay = new Date(sample.startDate).toLocaleDateString("en-US");
        dailyMap[localDay] = (dailyMap[localDay] ?? 0) + sample.quantity;
      });
      Alert.alert(JSON.stringify(dailyMap));

      const daily: number[] = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);
        const key = d.toLocaleDateString("en-US");
        daily.push(dailyMap[key] ?? 0);
      }
      Alert.alert(JSON.stringify(daily));
      const avg =
        daily.length > 0
          ? daily.reduce((sum, val) => sum + val, 0) / daily.length
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
