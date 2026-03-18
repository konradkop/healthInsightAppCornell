import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

type GPSLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export function useGPS() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ===== Check availability =====
  useEffect(() => {
    const checkAvailability = async () => {
      if (Platform.OS !== "ios" && Platform.OS !== "android") {
        setIsAvailable(false);
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      setIsAvailable(enabled);
    };

    checkAvailability();
  }, []);

  // ===== Request permissions =====
    const requestPermission = async () => {
        try {
        const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        return 'Foreground permission denied';
      }
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== 'granted') {
        return 'Background permission denied';
      }

      return true;
    } catch (err) {
      console.error("Location permission error:", err);
      setError("Permission request failed");
      return false;
    }
  };

  // ===== Fetch current location =====
  const fetchCurrentLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = result.coords;

      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy ?? null,
      });
    } catch (err) {
      console.error("Error fetching location:", err);
      setError("Failed to fetch location");
      Alert.alert("Error", "Could not fetch GPS location");
    }
  };

  // ===== Watch location (live updates) =====
  const watchLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // every 5s
          distanceInterval: 5, // or every 5 meters
        },
        (result) => {
          const coords = result.coords;

          setLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy ?? null,
          });
        }
      );

      return subscription; // caller can remove()
    } catch (err) {
      console.error("Error watching location:", err);
      setError("Failed to watch location");
    }
  };

  // ===== Reverse geocode (optional helper) =====
  const reverseGeocode = async () => {
    if (!location) return null;

    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      return result?.[0] ?? null;
    } catch (err) {
      console.error("Reverse geocode error:", err);
      return null;
    }
  };

  return {
    isAvailable,
    location,
    error,
    fetchCurrentLocation,
    watchLocation,
    reverseGeocode,
  };
}