import { Colors } from "@/constants/theme";
import React from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface DailyGiftedChartProps {
  title: string;
  data: number[];
  unit?: string;
}

export function DailyGiftedChart({ title, data, unit }: DailyGiftedChartProps) {
  const chartData = data.map((value, index) => ({
    value,
    label: `Day ${index + 1}`,
  }));

  const screenWidth = Dimensions.get("window").width;
  const SCREEN_WIDTH =
    Platform.OS === "ios" ? screenWidth - 10 : screenWidth - 10;
  const spacing = SCREEN_WIDTH / chartData.length;

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        isAnimated
        height={180}
        width={SCREEN_WIDTH}
        curved
        spacing={spacing}
        initialSpacing={10}
        hideRules={false}
        hideDataPoints={false}
        dataPointsWidth={6}
        thickness={3}
        color={Colors.light.tint}
        startFillColor={Colors.light.tint + "33"}
        endFillColor={Colors.light.tint + "00"}
        startOpacity={0.4}
      />

      <View style={styles.footer}>
        <Text style={styles.note}>Last {data.length} days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  avg: {
    fontSize: 16,
    fontWeight: "500",
  },
  note: {
    fontSize: 14,
    color: "#666",
  },
});
