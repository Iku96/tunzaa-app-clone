import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart, convertDailyGMVToChartData, convertWeeklyGMVToChartData, convertMonthlyGMVToChartData, formatLargeNumber, formatCurrency } from '@/components/charts/LineChart';
import { useGetDailyGMVPerformance, useGetWeeklyGMVPerformance, useGetMonthlyGMVPerformance } from '@/services/reports';
import { colors, typography, spacing } from '@/styles/theme';

interface LineChartUsageExampleProps {
  vendorId: string;
}

export function LineChartUsageExample({ vendorId }: LineChartUsageExampleProps) {
  // Fetch reports data
  const { data: dailyData, isLoading: dailyLoading } = useGetDailyGMVPerformance(vendorId);
  const { data: weeklyData, isLoading: weeklyLoading } = useGetWeeklyGMVPerformance(vendorId);
  const { data: monthlyData, isLoading: monthlyLoading } = useGetMonthlyGMVPerformance(vendorId);

  // Sample data in the correct chart-kit format
  const sampleDailyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [350000, 420000, 380000, 450000, 520000, 480000, 600000],
      },
    ],
  };

  const sampleWeeklyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      {
        data: [1500000, 1800000, 2200000, 1950000, 2500000],
      },
    ],
  };

  const sampleMonthlyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [7800000, 8200000, 7600000, 9100000, 9500000, 8700000],
      },
    ],
  };

  // Multi-dataset example
  const comparisonData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [2000000, 2500000, 2200000, 2800000, 3200000, 2900000],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [1800000, 2200000, 1900000, 2400000, 2800000, 2600000],
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Custom chart configurations
  const revenueChartConfig = {
    backgroundColor: colors.primary.light,
    backgroundGradientFrom: colors.primary.light,
    backgroundGradientTo: colors.primary.main,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffffff",
    },
    formatYLabel: (value: string) => formatLargeNumber(value),
  };

  const successChartConfig = {
    backgroundColor: colors.success,
    backgroundGradientFrom: colors.success,
    backgroundGradientTo: colors.success,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#ffffff",
    },
    formatYLabel: (value: string) => formatCurrency(value),
  };

  const warningChartConfig = {
    backgroundColor: colors.warning,
    backgroundGradientFrom: colors.warning,
    backgroundGradientTo: colors.warning,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#ffffff",
    },
    formatYLabel: (value: string) => `$${formatLargeNumber(value)}`,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Revenue Analytics Dashboard</Text>
      
      {/* Daily GMV Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Daily GMV Performance</Text>
        <LineChart
          data={dailyData ? convertDailyGMVToChartData(dailyData.data) : sampleDailyData}
          title="Daily Revenue Trend"
          height={250}
          yAxisLabel="$"
          formatYLabel={formatLargeNumber}
          chartConfig={revenueChartConfig}
          bezier
        />
      </View>

      {/* Weekly GMV Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weekly GMV Performance</Text>
        <LineChart
          data={weeklyData ? convertWeeklyGMVToChartData(weeklyData.data) : sampleWeeklyData}
          title="Weekly Revenue Growth"
          height={250}
          yAxisLabel="$"
          formatYLabel={formatCurrency}
          chartConfig={successChartConfig}
          bezier
        />
      </View>

      {/* Monthly GMV Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Monthly GMV Performance</Text>
        <LineChart
          data={monthlyData ? convertMonthlyGMVToChartData(monthlyData.data) : sampleMonthlyData}
          title="Monthly Revenue Overview"
          height={250}
          yAxisLabel="$"
          formatYLabel={formatLargeNumber}
          chartConfig={warningChartConfig}
          bezier
        />
      </View>

      {/* Multi-dataset Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Revenue Comparison</Text>
        <LineChart
          data={comparisonData}
          title="This Year vs Last Year"
          height={250}
          yAxisLabel="$"
          formatYLabel={formatLargeNumber}
          chartConfig={{
            backgroundColor: colors.background.secondary,
            backgroundGradientFrom: colors.background.secondary,
            backgroundGradientTo: colors.background.primary,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.text.primary,
            labelColor: (opacity = 1) => colors.text.primary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: colors.primary.main,
            },
          }}
          bezier
        />
      </View>

      {/* Customized Chart Examples */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Custom Styled Charts</Text>
        
        {/* No bezier curve */}
        <LineChart
          data={sampleDailyData}
          title="Linear Chart (No Bezier)"
          height={200}
          yAxisLabel="$"
          formatYLabel={formatLargeNumber}
          bezier={false}
          withShadow={false}
        />

        {/* Without dots */}
        <LineChart
          data={sampleWeeklyData}
          title="Smooth Line (No Dots)"
          height={200}
          yAxisLabel="$"
          formatYLabel={formatCurrency}
          withDots={false}
          bezier={true}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
        />

        {/* Minimal Grid */}
        <LineChart
          data={sampleDailyData}
          title="Minimal Grid Lines"
          height={200}
          yAxisLabel="$"
          formatYLabel={formatLargeNumber}
          withInnerLines={false}
          withVerticalLines={false}
          chartConfig={{
            backgroundColor: '#1e1e1e',
            backgroundGradientFrom: '#1e1e1e',
            backgroundGradientTo: '#2a2a2a',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#2ecc71",
            },
          }}
        />
      </View>

      {/* Error handling example */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Empty Data Handling</Text>
        <LineChart
          data={{ labels: [], datasets: [] }}
          title="No Data Available"
          height={200}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.md,
  },
  header: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  chartSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
});

// Real-world vendor dashboard example
export function VendorDashboardExample() {
  const vendorId = "vendor-123"; // Replace with actual vendor ID
  
  const { data: dailyData, isLoading } = useGetDailyGMVPerformance(vendorId);
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading charts...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vendor Performance Dashboard</Text>
      
      {dailyData && (
        <LineChart
          data={convertDailyGMVToChartData(dailyData.data)}
          title="30-Day GMV Performance"
          height={300}
          yAxisLabel="$"
          formatYLabel={formatCurrency}
          chartConfig={{
            backgroundColor: colors.primary.main,
            backgroundGradientFrom: colors.primary.main,
            backgroundGradientTo: colors.primary.dark,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffffff",
            },
          }}
          bezier
        />
      )}
    </View>
  );
}

// Example showing direct usage with your data format
export function DirectUsageExample() {
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [350000, 420000, 380000, 450000, 520000, 480000, 600000],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Direct Usage Example</Text>
      
      <LineChart
        data={chartData}
        title="Weekly Revenue"
        height={250}
        yAxisLabel="$"
        formatYLabel={formatLargeNumber}
        chartConfig={{
          backgroundColor: colors.primary.main,
          backgroundGradientFrom: colors.primary.main,
          backgroundGradientTo: colors.primary.dark,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffffff",
          },
        }}
        bezier
      />
    </View>
  );
} 