import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { useSession } from "./contexts/auth/ctx"; // ✅ new context

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { signIn } = useSession(); // ✅ new function
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const colors = {
    background: isDark ? "#0d0d0d" : "#f9fafb",
    card: isDark ? "#1c1c1e" : "#fff",
    text: isDark ? "#f2f2f2" : "#111",
    subtext: isDark ? "#aaa" : "#666",
    inputBorder: isDark ? "#333" : "#ddd",
    button: "#007AFF",
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      // If your signIn accepts credentials, pass them here
      await signIn();
      router.replace("/"); // ✅ navigate to main app
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Image
        source={require("../assets/images/cornell-circle.png")}
        style={{ width: 100, height: 100, alignSelf: "center" }}
      />

      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
            fontSize: 36,
            textAlign: "center",
          }}
        >
          Health Insight App Cornell
        </ThemedText>
      </ThemedView>

      <ThemedText style={[styles.title]}>Welcome Back 👋</ThemedText>
      <ThemedText style={[styles.subtitle]}>Sign in to continue</ThemedText>

      <View style={styles.form}>
        {error ? (
          <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
        ) : null}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.subtext}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          secureTextEntry
          placeholderTextColor={colors.subtext}
        />

        <TouchableOpacity
          onPress={handleSignIn}
          style={[
            styles.button,
            { backgroundColor: colors.button },
            loading && { opacity: 0.7 },
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={[styles.link, { color: colors.button }]}>
            Forgot your password?
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  titleContainer: {
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    fontSize: 16,
  },
  form: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 4,
    shadowColor: "#007AFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 17,
  },
  link: {
    textAlign: "center",
    fontWeight: "500",
    marginTop: 20,
  },
});
