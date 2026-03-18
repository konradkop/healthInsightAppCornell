import React, { createContext, useContext, useEffect } from "react";
import { useGPS } from "../../../hooks/useGPS";


type GPSContextType = ReturnType<typeof useGPS>;
const GPSContext = createContext<GPSContextType | null>(null);
// ===== Provider =====
export const GPSProvider = ({ children }: { children: React.ReactNode }) => {
  
  const gps = useGPS();

  // optional: auto-fetch on mount
  useEffect(() => {
    if (gps.isAvailable) {
      gps.fetchCurrentLocation();
    }
  }, [gps.isAvailable]);

  return <GPSContext.Provider value={gps}>{children}</GPSContext.Provider>;
};

// ===== Hook =====
export const useGPSContext = () => {
  const context = useContext(GPSContext);

  if (!context) {
    throw new Error("useGPSContext must be used within a GPSProvider");
  }

  return context;
};