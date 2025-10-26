import { Platform, StyleSheet, View, ViewProps } from "react-native";

interface CenteredContainerProps extends ViewProps {
  children: React.ReactNode;
}

export const CenteredContainer: React.FC<CenteredContainerProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: Platform.OS === "web" ? 1000 : "100%",
  },
});
