import { FontsTwo } from "@/constants/theme";
import { Text, TextProps } from "react-native";

interface TitleTextProps extends TextProps {
  children: React.ReactNode;
  style?: TextProps["style"];
}

export const TitleText: React.FC<TitleTextProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <Text
      style={[
        {
          fontFamily: FontsTwo.semibold,
          textAlign: "center",
          marginBottom: 16,
          fontSize: 36,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
