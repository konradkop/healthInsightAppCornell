import { createContext, use, type PropsWithChildren } from "react";

import { useStorageState } from "./useStorageState";

const AuthContext = createContext<{
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: async () => {},
  signOut: () => null,
  session: null,
  isLoading: false,
});

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: async (username: string, password: string) => {
          // Replace this when deploying to make sure it goes to the azure server when deploying
          // https://health-insight-app-cornell-2025-v3-asgyg9h5e4a0hbf4.eastus2-01.azurewebsites.net/auth/login
          // http://localhost:8000/auth/login
          const res = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Login failed");
          }
          const data = await res.json();
          setSession(data.token);
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
