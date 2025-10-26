import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  ...props
}) => {
  return (
    <View style={[styles.inputContainer]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Type a message..."
        placeholderTextColor={Colors.light.icon}
        style={styles.input}
        onSubmitEditing={onSend}
        returnKeyType="send"
        {...props}
      />
      <TouchableOpacity onPress={onSend} style={styles.sendButton}>
        <IconSymbol
          name="paperplane.fill"
          size={20}
          color={Colors.light.background}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
    borderColor: Colors.light.tabIconDefault,
  },
  sendButton: {
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.blue,
  },
});
