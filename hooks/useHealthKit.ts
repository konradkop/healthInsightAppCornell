// hooks/useHealthKit.ts
import { useCallback, useEffect, useState } from "react";
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

  const initHK = useCallback(() => {
    // HealthKit only exists on iOS devices
    if (Platform.OS !== "ios") {
      const msg = "HealthKit is only available on iOS devices";
      console.warn(msg);
      setHealthState({
        isAvailable: false,
        isAuthorized: false,
        error: msg,
      });
      return;
    }

    if (!AppleHealthKit || typeof AppleHealthKit.isAvailable !== "function") {
      // Build a safe description without dereferencing properties that may not exist
      let shapeDescription = "undefined";
      try {
        if (AppleHealthKit) {
          const keys = Object.keys(AppleHealthKit).slice(0, 20);
          shapeDescription = `object with keys: ${keys.join(", ")}`;
        }
      } catch (ex) {
        shapeDescription = `uninspectable (${String(ex)})`;
      }

      const msg = `AppleHealthKit not properly linked (native module missing). typeof=${typeof AppleHealthKit}; ${shapeDescription}`;
      console.error(msg, { AppleHealthKit });
      setHealthState({
        isAvailable: false,
        isAuthorized: false,
        error: msg,
      });
      return;
    }

    AppleHealthKit.isAvailable((err: any, available: boolean) => {
      if (err || !available) {
        const msg = `HealthKit not available: ${
          err ? JSON.stringify(err) : "not available"
        }`;
        console.error(msg, err);
        setHealthState({
          isAvailable: false,
          isAuthorized: false,
          error: msg,
        });
        return;
      }

      // initHealthKit will ask for authorization (react-native-health)
      AppleHealthKit.initHealthKit(permissions, (initErr: any) => {
        if (initErr) {
          const msg = `initHealthKit error: ${
            typeof initErr === "string" ? initErr : JSON.stringify(initErr)
          }`;
          console.error(msg, initErr);
          setHealthState({
            isAvailable: true,
            isAuthorized: false,
            error: msg,
          });
          return;
        }

        // Success: authorized (note: user can still deny some types)
        console.log("initHealthKit success");
        setHealthState((prev) => ({
          ...prev,
          isAvailable: true,
          isAuthorized: true,
          error: undefined,
        }));

        // Fetch today’s step count
        try {
          const today = new Date();
          const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ).toISOString();

          AppleHealthKit.getStepCount(
            { startDate: startOfDay },
            (scErr: any, result: any) => {
              if (scErr) {
                console.warn("getStepCount error:", scErr);
                return;
              }
              if (result?.value != null) {
                setHealthState((prev) => ({
                  ...prev,
                  stepCount: result.value,
                }));
              }
            }
          );

          AppleHealthKit.getHeartRateSamples(
            { startDate: startOfDay, limit: 1, ascending: false },
            (hrErr: any, results: any) => {
              if (hrErr) {
                console.warn("getHeartRateSamples error:", hrErr);
                return;
              }
              if (results && results.length > 0) {
                setHealthState((prev) => ({
                  ...prev,
                  heartRate: results[0].value,
                }));
              }
            }
          );
        } catch (ex) {
          console.error("Health data fetch exception:", ex);
        }
      });
    });
  }, []);

  useEffect(() => {
    initHK();
  }, [initHK]);

  // Expose a manual trigger so you can wire it to a button in TestFlight for re-testing
  return { ...healthState, triggerAuthorization: initHK };
};
