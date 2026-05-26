import React from "react";
import { View, Text, StyleSheet, Dimensions, ViewStyle } from "react-native";
import { LineChart as RNLineChart } from "react-native-chart-kit";
import { colors, typography, spacing } from "@/styles/theme";
import { commonStyles } from "@/styles/common";
import { useThemeColors, useResolvedThemeColors } from "@/hooks/useThemeColors";

const { width: screenWidth } = Dimensions.get("window");

interface ChartDataset {
  data: number[];
  color?: (opacity: number) => string;
  strokeWidth?: number;
}

interface LineChartProps {
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  title?: string;
  height?: number;
  width?: number;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  formatYLabel?: (value: string) => string;
  withDots?: boolean;
  withShadow?: boolean;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  withVerticalLines?: boolean;
  withHorizontalLines?: boolean;
  bezier?: boolean;
  style?: ViewStyle;
  chartConfig?: object;
}

export function LineChart({
  data,
  title,
  height = 220,
  width = screenWidth - 32,
  yAxisLabel = "",
  yAxisSuffix = "",
  formatYLabel,
  withDots = true,
  withShadow = true,
  withInnerLines = true,
  withOuterLines = true,
  withVerticalLines = true,
  withHorizontalLines = true,
  bezier = true, // Made smooth by default
  style,
  chartConfig,
}: LineChartProps) {
  // Use adaptive theming
  const themeColors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();

  if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
    // Get colors even for error state
    const backgroundColor = resolvedColors?.background || colors.background.secondary;
    const mutedTextColor = resolvedColors?.mutedForeground || colors.text.secondary;
    
    return (
      <View style={[styles.container, { height, backgroundColor: backgroundColor }]}>
        <Text style={[styles.placeholder, { color: mutedTextColor }]}>No data available</Text>
      </View>
    );
  }

  // Get success colors for the chart
  const successColor = resolvedColors?.success || '#10B981'; // Fallback to green
  const successColorWithOpacity = resolvedColors?.successWithOpacity || ((opacity: number) => `rgba(16, 185, 129, ${opacity})`);
  const backgroundColor = resolvedColors?.background || colors.background.secondary;
  const textColor = resolvedColors?.foreground || colors.text.primary;
  const mutedTextColor = resolvedColors?.mutedForeground || colors.text.secondary;
  const borderColor = resolvedColors?.border || colors.border;

  // Default chart configuration with adaptive theming
  const defaultChartConfig = {
    backgroundColor: backgroundColor,
    backgroundGradientFrom: backgroundColor,
    backgroundGradientTo: backgroundColor,
    decimalPlaces: 0,
    color: (opacity = 1) => successColorWithOpacity(opacity),
    labelColor: (opacity = 1) => `${mutedTextColor}${opacity === 1 ? '' : Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "3",
      stroke: successColor,
      fill: successColor,
    },
    propsForBackgroundLines: {
      strokeDasharray: "3,3",
      stroke: borderColor,
      strokeWidth: 1,
      strokeOpacity: 0.3,
    },
    propsForLabels: {
      fontSize: 12,
      fontFamily: typography.fontFamily.regular,
    },
    formatYLabel: formatYLabel || ((value) => `${yAxisLabel}${value}${yAxisSuffix}`),
    ...chartConfig,
  };

  // Ensure datasets have success color styling if not provided
  const styledData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      color: dataset.color || ((opacity = 1) => successColorWithOpacity(opacity)),
      strokeWidth: dataset.strokeWidth || 3, // Slightly thicker line for better visibility
    })),
  };

  return (
    <View style={[styles.container, { height: height + 60, backgroundColor: backgroundColor }]}>
      {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}
      <RNLineChart
        data={styledData}
        width={width}
        height={height}
        chartConfig={defaultChartConfig}
        withDots={withDots}
        withShadow={withShadow}
        withInnerLines={withInnerLines}
        withOuterLines={withOuterLines}
        withVerticalLines={withVerticalLines}
        withHorizontalLines={withHorizontalLines}
        bezier={bezier}
        style={{...styles.chart, ...style}}
      />
    </View>
  );
}

// Utility functions to convert reports API data to chart-kit format
export const convertDailyGMVToChartData = (
  dailyData: Array<{
    sales_date: string;
    daily_gmv: number;
  }>
) => {
  return {
    labels: dailyData.map(item => {
      const date = new Date(item.sales_date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        data: dailyData.map(item => item.daily_gmv),
      },
    ],
  };
};

export const convertWeeklyGMVToChartData = (
  weeklyData: Array<{
    week_start: string;
    weekly_gmv: number;
  }>
) => {
  return {
    labels: weeklyData.map(item => {
      const date = new Date(item.week_start);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        data: weeklyData.map(item => item.weekly_gmv),
      },
    ],
  };
};

export const convertMonthlyGMVToChartData = (
  monthlyData: Array<{
    month_start: string;
    monthly_gmv: number;
  }>
) => {
  return {
    labels: monthlyData.map(item => {
      const date = new Date(item.month_start);
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        data: monthlyData.map(item => item.monthly_gmv),
      },
    ],
  };
};

// Additional utility functions for other report types
export const convertOrderCountToChartData = (
  dailyData: Array<{
    sales_date: string;
    daily_orders: number;
  }>
) => {
  return {
    labels: dailyData.map(item => {
      const date = new Date(item.sales_date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        data: dailyData.map(item => item.daily_orders),
      },
    ],
  };
};

export const convertAOVToChartData = (
  dailyData: Array<{
    sales_date: string;
    daily_aov: number;
  }>
) => {
  return {
    labels: dailyData.map(item => {
      const date = new Date(item.sales_date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        data: dailyData.map(item => item.daily_aov),
      },
    ],
  };
};

// Helper function to format large numbers
export const formatLargeNumber = (value: string): string => {
  const num = parseFloat(value);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Helper function to format currency
export const formatCurrency = (value: string): string => {
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: spacing.sm,
  },
  placeholder: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    textAlign: "center",
    flex: 1,
    ...commonStyles.center,
  },
});
