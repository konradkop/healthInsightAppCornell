// HealthKitContextTypes.ts


export type DailyValue = {
  value: number;
  date: string;
};

export type DailyStats = {
  daily: DailyValue[];
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
  bodyFat: 18.5,

  heartRate: {
    daily: Array.from({ length: 7 }).map((_, i) => ({
      value: 62 + i,
      date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0],
    })),
    avg: 65,
  },

  stepCount: {
    daily: Array.from({ length: 7 }).map((_, i) => ({
      value: 6000 + i * 500,
      date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0],
    })),
    avg: 6500,
  },

  activeEnergy: {
    daily: Array.from({ length: 7 }).map((_, i) => ({
      value: 400 + i * 20,
      date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0],
    })),
    avg: 450,
  },

  flightsClimbed: {
    daily: Array.from({ length: 7 }).map((_, i) => ({
      value: 8 + i,
      date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0],
    })),
    avg: 10,
  },

  sleep: {
    daily: Array.from({ length: 7 }).map((_, i) => ({
      value: 6 + Math.random(),
      date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0],
    })),
    avg: 6.8,
  },
};