import { useHealthKit } from "@/hooks/useHealthKit";
import React, { createContext, ReactNode, useContext } from "react";
import { Platform } from "react-native";
import {
  defaultContext,
  HealthData,
  HealthKitContextType,
  sampleData,
} from "./HealthKitContextTypes";

const HealthKitContext = createContext<HealthKitContextType>(defaultContext);

export const HealthKitProvider = ({ children }: { children: ReactNode }) => {
  const {
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
  } = useHealthKit();

  const useSample =
    !isAvailable || isAvailable === null || Platform.OS !== "ios";

  const healthData: HealthData = useSample
    ? sampleData
    : {
        bodyFat: bodyFat ?? 0,
        heartRate: heartRate ?? 0,
        stepCount: stepCount ?? 0,
        activeEnergy: activeEnergy ?? 0,
        flightsClimbed: flightsClimbed ?? 0,
        sleep: sleep ?? 0,
      };

  const fetchAllHealthData = async () => {
    if (useSample) return;
    try {
      await Promise.all([
        fetchBodyFat(),
        fetchStepCount(),
        fetchHeartRate(),
        fetchActiveEnergy(),
        fetchFlightsClimbed(),
        fetchSleep(),
      ]);
    } catch (err) {
      console.error("Error fetching HealthKit data:", err);
    }
  };

  return (
    <HealthKitContext.Provider
      value={{
        isAvailable,
        healthData,
        fetchBodyFat,
        fetchHeartRate,
        fetchStepCount,
        fetchActiveEnergy,
        fetchFlightsClimbed,
        fetchAllHealthData,
        fetchSleep,
      }}
    >
      {children}
    </HealthKitContext.Provider>
  );
};

export const useSharedHealthKit = () => useContext(HealthKitContext);
