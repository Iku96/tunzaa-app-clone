import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  ProgressChart,
  ContributionGraph,
  StackedBarChart 
} from 'react-native-chart-kit';
import { 
  useGetDailyGMVPerformance, 
  useGetOrderStatusDistribution, 
  useGetTopPerformingProducts,
  useGetVendorGMV 
} from '@/services/reports';
import { colors, typography, spacing } from '@/styles/theme';

const { width: screenWidth } = Dimensions.get('window');

interface ChartKitDashboardProps {
  vendorId: string;
}

export function ChartKitDashboard({ vendorId }: ChartKitDashboardProps) {
  // Fetch data from reports API
  const { data: dailyData } = useGetDailyGMVPerformance(vendorId);
  const { data: statusData } = useGetOrderStatusDistribution(vendorId);
  const { data: topProducts } = useGetTopPerformingProducts(vendorId);
  const { data: vendorGMV } = useGetVendorGMV(vendorId);

  // Chart configurations
  const chartConfig = {
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
  };

  const lightChartConfig = {
    backgroundColor: colors.background.secondary,
    backgroundGradientFrom: colors.background.secondary,
    backgroundGradientTo: colors.background.primary,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary.main,
    labelColor: (opacity = 1) => colors.text.primary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: colors.primary.main,
    },
  };

  // Sample data for demonstration
  const sampleDailyRevenue = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [2000, 4500, 2800, 8000, 9900, 4300, 6200],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const sampleBarData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
      },
    ],
  };

  const samplePieData = statusData?.data ? statusData.data.map(item => ({
    name: item.status,
    population: item.order_count,
    color: getStatusColor(item.status),
    legendFontColor: colors.text.primary,
    legendFontSize: 12,
  })) : [
    {
      name: "Delivered",
      population: 215,
      color: colors.success,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: "Pending",
      population: 280,
      color: colors.warning,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: "Cancelled",
      population: 527,
      color: colors.error,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: "Processing",
      population: 853,
      color: colors.primary.main,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
  ];

  const sampleProgressData = {
    labels: ["Orders", "Revenue", "Customers", "Products"],
    data: [0.8, 0.65, 0.45, 0.92],
  };

  const sampleStackedBarData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    legend: ["Online", "Store", "Mobile"],
    data: [
      [60, 60, 60],
      [30, 30, 60],
      [90, 40, 70],
      [50, 80, 90],
    ],
    barColors: [colors.primary.main, colors.success, colors.warning],
  };

  const sampleContributionData = [
    { date: "2024-01-02", count: 1 },
    { date: "2024-01-03", count: 2 },
    { date: "2024-01-04", count: 3 },
    { date: "2024-01-05", count: 4 },
    { date: "2024-01-06", count: 5 },
    { date: "2024-01-30", count: 2 },
    { date: "2024-01-31", count: 3 },
    { date: "2024-03-01", count: 2 },
    { date: "2024-04-02", count: 4 },
    { date: "2024-03-05", count: 2 },
    { date: "2024-02-30", count: 4 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Analytics Dashboard</Text>
      <Text style={styles.subHeader}>Complete Report Overview</Text>

      {/* Line Chart - Revenue Trend */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>📈 Revenue Trend</Text>
        <LineChart
          data={sampleDailyRevenue}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Bar Chart - Monthly Comparison */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>📊 Monthly Orders</Text>
        <BarChart
          data={sampleBarData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={lightChartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          fromZero={true}
        />
      </View>

      {/* Pie Chart - Order Status Distribution */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>🎯 Order Status Distribution</Text>
        <PieChart
          data={samplePieData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 10]}
          absolute
          style={styles.chart}
        />
      </View>

      {/* Progress Chart - KPI Performance */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>🎯 KPI Performance</Text>
        <ProgressChart
          data={sampleProgressData}
          width={screenWidth - 32}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={false}
          style={styles.chart}
        />
      </View>

      {/* Stacked Bar Chart - Sales Channel Performance */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>📱 Sales Channel Performance</Text>
        <StackedBarChart
          data={sampleStackedBarData}
          width={screenWidth - 32}
          height={220}
          chartConfig={lightChartConfig}
          style={styles.chart}
          hideLegend={false}
        />
      </View>

      {/* Contribution Graph - Activity Heatmap */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>🔥 Sales Activity Heatmap</Text>
        <ContributionGraph
          values={sampleContributionData}
          endDate={new Date("2024-04-01")}
          numDays={105}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          tooltipDataAttrs={(value) => ({})}
        />
      </View>

      {/* Custom styled charts */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>🎨 Custom Themed Charts</Text>
        
        {/* Dark theme line chart */}
        <LineChart
          data={sampleDailyRevenue}
          width={screenWidth - 32}
          height={200}
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
          bezier
          style={styles.chart}
        />

        {/* Orange gradient bar chart */}
        <BarChart
          data={sampleBarData}
          width={screenWidth - 32}
          height={200}
          yAxisLabel="$"
          yAxisSuffix="k"
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
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

// Helper function to get color based on order status
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'delivered':
    case 'completed':
      return colors.success;
    case 'pending':
    case 'processing':
      return colors.warning;
    case 'cancelled':
    case 'failed':
      return colors.error;
    default:
      return colors.primary.main;
  }
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
    marginBottom: spacing.xs,
  },
  subHeader: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
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
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
});

// Utility functions for converting reports API data to chart-kit format
export const convertDailyGMVToLineChart = (dailyData: any[]) => ({
  labels: dailyData.map(item => {
    const date = new Date(item.sales_date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }),
  datasets: [
    {
      data: dailyData.map(item => item.daily_gmv),
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: 2,
    },
  ],
});

export const convertOrderStatusToPieChart = (statusData: any[]) => 
  statusData.map(item => ({
    name: item.status,
    population: item.order_count,
    color: getStatusColor(item.status),
    legendFontColor: colors.text.primary,
    legendFontSize: 12,
  }));

export const convertTopProductsToBarChart = (productsData: any[]) => ({
  labels: productsData.slice(0, 6).map(item => item.product_name.substring(0, 8)),
  datasets: [
    {
      data: productsData.slice(0, 6).map(item => item.product_gmv),
    },
  ],
});

// Example usage with real API data
export function RealDataDashboard({ vendorId }: { vendorId: string }) {
  const { data: dailyData } = useGetDailyGMVPerformance(vendorId);
  const { data: statusData } = useGetOrderStatusDistribution(vendorId);
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Live Dashboard</Text>
      
      {dailyData && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Daily GMV Performance</Text>
          <LineChart
            data={convertDailyGMVToLineChart(dailyData.data)}
            width={screenWidth - 32}
            height={220}
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
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}
      
      {statusData && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Order Status Distribution</Text>
          <PieChart
            data={convertOrderStatusToPieChart(statusData.data)}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: colors.background.secondary,
              backgroundGradientFrom: colors.background.secondary,
              backgroundGradientTo: colors.background.primary,
              color: (opacity = 1) => colors.text.primary,
              labelColor: (opacity = 1) => colors.text.primary,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
            style={styles.chart}
          />
        </View>
      )}
    </ScrollView>
  );
} 