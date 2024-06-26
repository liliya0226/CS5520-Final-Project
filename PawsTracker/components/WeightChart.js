import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { LineChart } from "react-native-chart-kit";
import { format } from "date-fns";
import colors from "../config/colors";
import font from "../config/font";

/**
 * Use the weightData to calculate the average weight by month and reflected on Chart
 * @param {weightData} passed by Weight.js
 * @returns
 */
export default function WeightChart({ weightData }) {
  const groupByMonth = {};
  // Group the data by month from weightData
  weightData.forEach((item) => {
    const month = format(new Date(item.date), "MM");
    if (!groupByMonth[month]) {
      groupByMonth[month] = [];
    }
    groupByMonth[month].push(item.record);
  });

  const averageWeights = {};
  // calculated the sum of weight from groups and store the average to the averageWeights list.
  for (const month in groupByMonth) {
    const weights = groupByMonth[month];
    const sum = weights.reduce((total, weight) => total + weight, 0);
    averageWeights[month] = sum / weights.length;
  }

  // sort it by month and restore it back to weight array
  let dates = Object.keys(averageWeights);
  dates = dates.sort((a, b) => Number(a) - Number(b));
  const weights = dates.map((month) => averageWeights[month]);

  const chartConfig = {
    backgroundGradientFrom: colors.chartColor,
    backgroundGradientTo: colors.chartColor,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
  };
  const height = Dimensions.get("screen").height;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Average by Month</Text>
      <LineChart
        data={{
          labels: dates,
          datasets: [
            {
              data: weights,
            },
          ],
        }}
        // responsive the chart width and height based on screen dimension
        width={Dimensions.get("screen").width * 0.85}
        height={height > 1024 ? height * 0.25 : height * 0.2}
        yAxisSuffix="kg"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",

    // backgroundColor: "#fff",
  },
  title: {
    fontSize: font.medium,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
