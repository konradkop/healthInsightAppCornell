export type HealthData = {
  bodyFat: number;
  heartRate: number;
  stepCount: number;
  activeEnergy: number;
  flightsClimbed: number;
};

export type HealthKitContextType = {
  isAvailable: boolean | null;
  healthData: HealthData;
  fetchBodyFat: () => Promise<void>;
  fetchHeartRate: () => Promise<void>;
  fetchStepCount: () => Promise<void>;
  fetchActiveEnergy: () => Promise<void>;
  fetchFlightsClimbed: () => Promise<void>;
};

export const sampleData: HealthData = {
  bodyFat: 22.5,
  heartRate: 72,
  stepCount: 7560,
  activeEnergy: 450,
  flightsClimbed: 12,
};

export const defaultContext: HealthKitContextType = {
  isAvailable: null,
  healthData: sampleData,
  fetchBodyFat: async () => {},
  fetchHeartRate: async () => {},
  fetchStepCount: async () => {},
  fetchActiveEnergy: async () => {},
  fetchFlightsClimbed: async () => {},
};
