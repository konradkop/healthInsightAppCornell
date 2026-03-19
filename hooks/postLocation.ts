import { baseURL } from "@/app/urls";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { GPSLocation } from "./useGPS";

type UsePostLocationReturn = {
  postLocation: (userId: number, gpsData: GPSLocation) => Promise<void>;
  loading: boolean;
  error: string | null;
};

export const usePostLocation = (): UsePostLocationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postLocation = useCallback(
    async (userId: number, gpsData: GPSLocation) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${baseURL}/location/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gpsData),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

      } catch (err: any) {
        console.error("Error posting location:", err);
        setError(err.message);
        Alert.alert(
          "Location Error",
          "Could not update location. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { postLocation, loading, error };
};