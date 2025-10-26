import { CenteredContainer } from "@/components/centered-component";
import { ChatInput } from "@/components/chat-input";
import { ChatText } from "@/components/chat-text";
import { TitleText } from "@/components/title-text";
import { Colors } from "@/constants/theme";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function HomeScreen() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "👋 Hi there! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { id: Date.now(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "This is a placeholder response",
        },
      ]);
    }, 800);
  };

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
            contentContainerStyle={{ padding: 16 }}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            <TitleText>Health Insight Chatbot</TitleText>

            {messages.map((msg) => (
              <ChatText key={msg.id} text={msg.text} sender={msg.sender} />
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
