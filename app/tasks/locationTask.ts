import { GPSLocation } from "@/hooks/useGPS";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Alert, Platform } from "react-native";
import { baseURL } from "../urls";

const LOCATION_TASK_NAME = "background-location-task";

type LocationTaskEvent = {
  data?: {
    locations: Location.LocationObject[];
  };
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data }: LocationTaskEvent) => {
    if (data) {
        const { locations } = data;
        for (const loc of locations) {
            const { latitude, longitude, accuracy } : GPSLocation = loc.coords;
            console.log("Background location received:", loc.coords);

            await fetch(`${baseURL}/location/1`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude, accuracy }),
            });
        }
        Alert.alert("Background location has been sent");
    }
});

export const startLocationTask = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== "granted") {
    console.warn("Background location permission not granted");
    return;
  }

  if (Platform.OS !== "ios"){
     Alert.alert("Location task not started because not on ios"); 
  }
  else{
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 50, // update every 50 meters
      deferredUpdatesDistance: 500,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Health App",
        notificationBody: "Tracking your location in the background",
      },
    });
    Alert.alert("✅ Background location task started");
  }
  }


};