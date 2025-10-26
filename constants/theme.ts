import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#a2a8adff",
    tabIconSelected: tintColorLight,
    blue: "#007AFF",
    lightGrey: "#E5E5EA",
    lightLightGrey: "#e7e7e7ff",
    sentMessageColor: "#FFFFFF",
    receivedMessageColor: "#000000",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const FontsTwo = {
  // iOS system fonts (San Francisco family)
  regular: "System", // automatically maps to SF Pro Text on iOS
  medium: "System",
  semibold: "System",
  bold: "System",

  // Display fonts (if you want to use SF Pro Display)
  displayRegular: "SFProDisplay-Regular",
  displayMedium: "SFProDisplay-Medium",
  displaySemibold: "SFProDisplay-Semibold",
  displayBold: "SFProDisplay-Bold",

  // Monospace
  mono: "Menlo", // iOS default monospace; good fallback
};
