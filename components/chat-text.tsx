import { Colors, FontsTwo } from "@/constants/theme";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

interface ChatTextProps {
  text: string;
  sender: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ChatText: React.FC<ChatTextProps> = ({
  text,
  sender,
  style,
  textStyle,
}) => {
  const isUser = sender === "user";

  const bubbleColor = isUser ? Colors.light.blue : Colors.light.lightGrey;
  const textColor = isUser
    ? Colors.light.sentMessageColor
    : Colors.light.receivedMessageColor;

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.botBubble,
        { backgroundColor: bubbleColor },
        style,
      ]}
    >
      <Text
        style={[
          { color: textColor, fontSize: 16, fontFamily: FontsTwo.regular },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 16,
    marginVertical: 6,
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  botBubble: {
    alignSelf: "flex-start",
  },
});
