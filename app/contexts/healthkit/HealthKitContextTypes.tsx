// HealthKitContextTypes.ts

export type DailyStats = {
  daily: number[];
  avg: number | null;
};

export type HealthData = {
  bodyFat: number;
  heartRate: DailyStats;
  stepCount: DailyStats;
  activeEnergy: DailyStats;
  flightsClimbed: DailyStats;
  sleep: DailyStats;
};

export type HealthKitContextType = {
  isAvailable: boolean | null;
  healthData: HealthData;
  fetchBodyFat: () => Promise<void>;
  fetchHeartRate: () => Promise<void>;
  fetchStepCount: () => Promise<void>;
  fetchActiveEnergy: () => Promise<void>;
  fetchFlightsClimbed: () => Promise<void>;
  fetchAllHealthData: () => Promise<void>;
  fetchSleep: () => Promise<void>;
};

export const defaultContext: HealthKitContextType = {
  isAvailable: null,
  healthData: {
    bodyFat: 0,
    heartRate: { daily: [], avg: null },
    stepCount: { daily: [], avg: null },
    activeEnergy: { daily: [], avg: null },
    flightsClimbed: { daily: [], avg: null },
    sleep: { daily: [], avg: null },
  },
  fetchBodyFat: async () => {},
  fetchHeartRate: async () => {},
  fetchStepCount: async () => {},
  fetchActiveEnergy: async () => {},
  fetchFlightsClimbed: async () => {},
  fetchAllHealthData: async () => {},
  fetchSleep: async () => {},
};

// Example sample data
export const sampleData: HealthData = {
  bodyFat: 22.5,
  heartRate: { daily: [70, 72, 68, 75, 69, 71, 70], avg: 70.7 },
  stepCount: {
    daily: [5000, 6500, 7000, 4000, 8000, 7500, 6000],
    avg: 6142.86,
  },
  activeEnergy: { daily: [250, 300, 280, 200, 320, 310, 290], avg: 278.57 },
  flightsClimbed: { daily: [10, 12, 8, 15, 9, 11, 10], avg: 10.71 },
  sleep: { daily: [9, 8, 8, 9, 9, 8, 9], avg: 8.5 },
};
