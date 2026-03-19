import { CenteredContainer } from "@/components/centered-component";
import { ChatInput } from "@/components/chat-input";
import { ChatText } from "@/components/chat-text";
import { TitleText } from "@/components/title-text";
import { Colors } from "@/constants/theme";

import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useGPSContext } from "../contexts/gps/GPSContext";
import { useSharedHealthKit } from "../contexts/healthkit/HealthKitContext";
import { baseURL } from "../urls";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "👋 Hi there! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const { healthData } = useSharedHealthKit();
  const { location } = useGPSContext();

  const healthDataPayload = {
    bodyFat: healthData.bodyFat,
    heartRate: healthData.heartRate,
    stepCount: healthData.stepCount,
    activeEnergy: healthData.activeEnergy,
    flightsClimbed: healthData.flightsClimbed,
    sleep: healthData.sleep,
  };

  const gpsDataPayload =
  {
        latitude: location ? location.latitude : null,
        longitude: location ? location.longitude :null ,
        accuracy: location? location.accuracy: null,
  }
  

  const fetchChatHistory = async () => {
  try {
    const response = await fetch(`${baseURL}/chat/history/1`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer dummy-token-12345", // dummy token
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data?.messages) {
      setMessages(data.messages.map((msg: any, idx: number) => ({
        id: idx + 1, // simple ID if your DB doesn't return one
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })));
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
  }
};

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMessage = { id: Date.now(), role: "user", content: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    
    try {

      const response = await fetch(
        `${baseURL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: 1,
            messages: [...messages, newMessage].map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            })),
            health_data: healthDataPayload,
            gps_data: gpsDataPayload,
            use_harm_guardrail: false,
            use_mi_check_guardrail: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const botReply =
        data?.response ||
        data?.message ||
        "Sorry, I couldn’t understand that right now.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", content: botReply },
      ]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          content:
            "⚠️ There was an issue connecting to the server. Please try again later.",
        },
      ]);
    }
  };

  useEffect(() => {
  fetchChatHistory();
}, []);

  return (
    <View style={[styles.container]}>
      <CenteredContainer>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={{ padding: 16, paddingTop: 50 }}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            <TitleText>Health Insight Chatbot</TitleText>

            {messages.map((msg) => (
              <ChatText key={msg.id} text={msg.content} sender={msg.role} />
            ))}
          </ScrollView>

          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={handleSend}
          />
        </KeyboardAvoidingView>
      </CenteredContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 10,
  },
  chatContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
