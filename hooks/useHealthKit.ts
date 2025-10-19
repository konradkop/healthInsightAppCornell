// hooks/useHealthKit.ts
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import AppleHealthKit, { HealthKitPermissions } from "react-native-health";

interface HealthKitState {
  isAvailable: boolean;
  isAuthorized: boolean;
  stepCount?: number;
  heartRate?: number;
  error?: string;
}

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.Height,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.SleepAnalysis, 
    ],
    write: [
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.Height,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
    ],
  },
};

export const useHealthKit = () => {
  const [healthState, setHealthState] = useState<HealthKitState>({
    isAvailable: false,
    isAuthorized: false,
  });

  useEffect(() => {
    // HealthKit only exists on iOS devices
    if (Platform.OS !== "ios") {
      setHealthState({
        isAvailable: false,
        isAuthorized: false,
        error: "HealthKit is only available on iOS devices",
      });
      return;
    }

    if (!AppleHealthKit || typeof AppleHealthKit.isAvailable !== "function") {
      setHealthState({
        isAvailable: false,
        isAuthorized: false,
        error: `AppleHealthKit not properly linked: ${AppleHealthKit.isAvailable}`,
      });
      return;
    }

    AppleHealthKit.isAvailable((err, available) => {
      if (err || !available) {
        setHealthState({
          isAvailable: false,
          isAuthorized: false,
          error: "HealthKit not available",
        });
        return;
      }

      AppleHealthKit.initHealthKit(permissions, (err) => {
        if (err) {
          setHealthState({
            isAvailable: true,
            isAuthorized: false,
            error: err,
          });
        } else {
          setHealthState((prev) => ({
            ...prev,
            isAvailable: true,
            isAuthorized: true,
          }));

          // Fetch today’s step count
          const today = new Date();
          const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ).toISOString();

          AppleHealthKit.getStepCount(
            { startDate: startOfDay },
            (err, result) => {
              if (!err && result?.value != null) {
                setHealthState((prev) => ({
                  ...prev,
                  stepCount: result.value,
                }));
              }
            }
          );

          // Fetch latest heart rate
          AppleHealthKit.getHeartRateSamples(
            { startDate: startOfDay, limit: 1, ascending: false },
            (err, results) => {
              if (!err && results && results.length > 0) {
                setHealthState((prev) => ({
                  ...prev,
                  heartRate: results[0].value,
                }));
              }
            }
          );
        }
      });
    });
  }, []);

  return healthState;
};
