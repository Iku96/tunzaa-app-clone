import { View, ScrollView, Dimensions } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Package,
  TrendingUp as TrendUp,
  Users,
  Plus,
  MessageCircle,
  Banknote
} from "lucide-react-native";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useI18n } from "@/hooks/useI18n";
const { width: screenWidth } = Dimensions.get("window");
import { LineChart } from "@/components/charts/LineChart";
import { useGetVendorOrders } from "@/services/order-management";
import { OrderCard } from "@/components/orders/OrderCard";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import {
  useGetVendorGMV,
  useGetOrderStatusDistribution,
  useGetTopPerformingProducts,
  useGetDailyGMVPerformance,
  useGetWeeklyGMVPerformance,
  useGetMonthlyGMVPerformance,
} from "@/services/reports";
import { useBrandStyles, useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { NotificationIcon } from "../NotificationIcon";

type TimePeriod = "daily" | "weekly" | "monthly";

// Utility functions for generating periods up to current date
// Utility functions for generating periods up to current date
const formatDateToLocalISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generatePeriodsUpToNow = (timePeriod: TimePeriod) => {
  const now = new Date();
  const periods: string[] = [];

  switch (timePeriod) {
    case "daily":
      const year = now.getFullYear();
      const month = now.getMonth();
      const today = now.getDate();

      // Generate last 7 days instead of just current month to ensure we have data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(today - i);
        periods.push(formatDateToLocalISO(date));
      }
      break;

    case "weekly":
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

      const firstWeekStart = new Date(firstDayOfMonth);
      const dayOfWeek = firstWeekStart.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      firstWeekStart.setDate(firstWeekStart.getDate() - daysToSubtract);

      const currentWeekStart = new Date(now);
      const currentDayOfWeek = currentWeekStart.getDay();
      const currentDaysToSubtract = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      currentWeekStart.setDate(currentWeekStart.getDate() - currentDaysToSubtract);

      const current = new Date(firstWeekStart);
      while (current <= currentWeekStart) {
        periods.push(formatDateToLocalISO(current));
        current.setDate(current.getDate() + 7);
      }
      break;

    case "monthly":
      const currentYearForMonths = now.getFullYear();
      const currentMonthIndex = now.getMonth();

      for (let monthIndex = 0; monthIndex <= currentMonthIndex; monthIndex++) {
        const date = new Date(currentYearForMonths, monthIndex, 1);
        periods.push(formatDateToLocalISO(date));
      }
      break;
  }

  return periods;
};

// Data processing functions
const processChartData = (
  rawData: any[],
  timePeriod: TimePeriod
) => {
  const allPeriods = generatePeriodsUpToNow(timePeriod);

  if (allPeriods.length === 0) {
    return { labels: [], data: [] };
  }

  const dataMap = new Map<string, number>();

  rawData.forEach(item => {
    let key: string;
    let value: number;

    switch (timePeriod) {
      case "daily":
        key = item.sales_date;
        value = item.daily_gmv;
        break;
      case "weekly":
        key = item.week_start;
        value = item.weekly_gmv;
        break;
      case "monthly":
        key = item.month_start;
        value = item.monthly_gmv;
        break;
    }

    dataMap.set(key, value);
  });

  const chartData = allPeriods.map(period => dataMap.get(period) || 0);

  const labels = allPeriods.map(period => {
    // Append time to ensure it's parsed as local time, not UTC
    const date = new Date(period + 'T00:00:00');
    switch (timePeriod) {
      case "daily":
        return date.toLocaleDateString("en-US", { day: "numeric" });
      case "weekly":
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      case "monthly":
        return date.toLocaleDateString("en-US", { month: "short" });
    }
  });

  return { labels, data: chartData };
};

export function VendorHome() {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>("daily");
  const resolvedColors = useResolvedThemeColors();
  const brandStyles = useBrandStyles();
  const { vendorDetails } = useProfileDetails();
  const { isDesktop } = useResponsive();
  const VENDOR_ID = vendorDetails?.vendor_id;

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetVendorOrders(
    {
      vendor_id: VENDOR_ID || "",
      limit: 5,
    },
    !!VENDOR_ID
  );

  const { data: gmvData, isLoading: gmvLoading } = useGetVendorGMV(
    VENDOR_ID || "",
    !!VENDOR_ID
  );

  const { data: orderStatusData } = useGetOrderStatusDistribution(
    VENDOR_ID || "",
    !!VENDOR_ID
  );

  const { data: topProductsData } = useGetTopPerformingProducts(
    VENDOR_ID || "",
    !!VENDOR_ID
  );

  const { data: dailyGMVData } = useGetDailyGMVPerformance(
    VENDOR_ID || "",
    !!VENDOR_ID
  );

  const { data: weeklyGMVData } = useGetWeeklyGMVPerformance(
    VENDOR_ID || "",
    !!VENDOR_ID
  );

  const { data: monthlyGMVData } = useGetMonthlyGMVPerformance(
    VENDOR_ID || "",
    !!VENDOR_ID
  );

  console.log("GMV Data", gmvData);
  console.log("Daily GMV Data", dailyGMVData);
  console.log("Weekly GMV Data", weeklyGMVData);
  console.log("Monthly GMV Data", monthlyGMVData);

  useFocusEffect(
    useCallback(() => {
      refetchOrders();
    }, [refetchOrders])
  );

  const vendorStats = gmvData?.data?.[0];
  const stats = {
    revenue: {
      total: vendorStats?.["orders.total_revenue"] || 0,
      change: 0,
    },
    orders: {
      total: vendorStats?.["orders.count"] || 0,
      change: 0,
    },
    products: {
      total: topProductsData?.data?.length || 0,
      change: 0,
    },
    customers: {
      total: 0,
      change: 0,
    },
  };

  const getChartData = () => {
    let rawData: any[] = [];

    switch (selectedTimePeriod) {
      case "daily":
        rawData = dailyGMVData?.data || [];
        break;
      case "weekly":
        rawData = weeklyGMVData?.data || [];
        break;
      case "monthly":
        rawData = monthlyGMVData?.data || [];
        break;
    }

    const { labels, data } = processChartData(rawData, selectedTimePeriod);

    if (data.length === 0 || data.every(value => value === 0)) {
      return null;
    }

    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    };
  };

  const revenueData = getChartData();
  const hasRevenueData = revenueData !== null;

  const chartConfig = {
    fromZero: true,
    formatYLabel: (value: string) => {
      const num = parseInt(value);
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return value;
    },
  };

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showSecondaryNav={true}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-muted"
    >
      <View className={`flex-1 bg-background ${isDesktop ? 'py-8' : 'p-4'}`}>
        {isDesktop ? (
          // Desktop Layout
          <View className="flex-1">
            {/* Header */}

            {/* Stats Grid */}
            <View className="flex-row flex-wrap gap-6 mb-8">
              <Card
                className="w-[calc(25%-1.5rem)] p-6"
                {...brandStyles.successBorder()}
                style={[{ borderWidth: 2 }]}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Banknote size={32} className="text-primary" color={resolvedColors.success} />
                  {/* <Badge variant="success">+{stats.revenue.change}%</Badge> */}
                </View>
                <Text className="text-3xl font-bold text-foreground mb-1">
                  TShs {stats.revenue.total.toLocaleString()}
                </Text>
                <Text className="text-base text-muted-foreground">{t("vendor.home.total_revenue")}</Text>
              </Card>

              <Card className="w-[calc(25%-1.5rem)] p-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Package size={32} className="text-primary" color={resolvedColors.primary} />
                  {/* <Badge variant="success">+{stats.orders.change}%</Badge> */}
                </View>
                <Text className="text-3xl font-bold text-foreground mb-1">
                  {stats.orders.total}
                </Text>
                <Text className="text-base text-muted-foreground">{t("vendor.home.total_orders")}</Text>
              </Card>

              <Card className="w-[calc(25%-1.5rem)] p-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Package size={32} className="text-primary" color={resolvedColors.primary} />
                  {/* <Badge variant="destructive">{stats.products.change}%</Badge> */}
                </View>
                <Text className="text-3xl font-bold text-foreground mb-1">
                  {stats.products.total}
                </Text>
                <Text className="text-base text-muted-foreground">{t("vendor.home.active_products")}</Text>
              </Card>

              <Card className="w-[calc(25%-1.5rem)] p-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Users size={32} className="text-primary" color={resolvedColors.primary} />
                  {/* <Badge variant="success">+{stats.customers.change}%</Badge> */}
                </View>
                <Text className="text-3xl font-bold text-foreground mb-1">
                  {stats.customers.total}
                </Text>
                <Text className="text-base text-muted-foreground">{t("vendor.home.customers")}</Text>
              </Card>
            </View>

            {/* Revenue Chart and Recent Orders Side by Side */}
            <View className="flex-row gap-6">
              {/* Revenue Chart */}
              <View className="flex-1">
                <Card className="p-6 mb-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-semibold text-foreground">
                      {t("vendor.home.revenue_overview")}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-4">


                    <Button
                      variant={selectedTimePeriod === "daily" ? "primary" : "outline"}
                      size="sm"
                      onPress={() => setSelectedTimePeriod("daily")}
                    >
                      <Text className={`text-sm ${selectedTimePeriod === "daily" ? "text-white" : "text-foreground"}`}>
                        {t("vendor.home.daily")}
                      </Text>
                    </Button>
                    <Button
                      variant={selectedTimePeriod === "weekly" ? "primary" : "outline"}
                      size="sm"
                      onPress={() => setSelectedTimePeriod("weekly")}
                    >
                      <Text className={`text-sm ${selectedTimePeriod === "weekly" ? "text-white" : "text-foreground"}`}>
                        {t("vendor.home.weekly")}
                      </Text>
                    </Button>
                    <Button
                      variant={selectedTimePeriod === "monthly" ? "primary" : "outline"}
                      size="sm"
                      onPress={() => setSelectedTimePeriod("monthly")}
                    >
                      <Text className={`text-sm ${selectedTimePeriod === "monthly" ? "text-white" : "text-foreground"}`}>
                        {t("vendor.home.monthly")}
                      </Text>
                    </Button>

                  </View>
                  {hasRevenueData ? (
                    <LineChart
                      data={revenueData}
                      width={screenWidth * 0.5} // Wider chart for desktop
                      chartConfig={chartConfig}
                      yAxisLabel="TShs "
                      formatYLabel={chartConfig.formatYLabel}
                    />
                  ) : (
                    <View className="p-8 items-center justify-center">
                      <Package size={64} className="text-muted-foreground mb-4 opacity-50" color={resolvedColors.foreground} />
                      <Text className="text-xl font-semibold text-muted-foreground mb-2">
                        {t("vendor.home.no_sales_data")}
                      </Text>
                      <Text className="text-base text-muted-foreground text-center">
                        {t("vendor.home.no_sales_message")}
                      </Text>
                    </View>
                  )}
                </Card>
              </View>

              {/* Recent Orders */}
              <View className="w-[40%]">
                <Card className="p-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-semibold text-foreground">
                      {t("vendor.home.recent_orders")}
                    </Text>
                    <Button variant="link" onPress={() => router.push("/orders")}>
                      <Text className="text-base font-semibold text-primary">
                        {t("vendor.home.view_all")}
                      </Text>
                    </Button>
                  </View>
                  {ordersLoading ? (
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-muted-foreground">{t("vendor.home.loading_orders")}</Text>
                    </View>
                  ) : ordersError ? (
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-destructive mb-4">
                        {t("vendor.home.failed_to_load_orders")}
                      </Text>
                      <Button onPress={() => refetchOrders()}>
                        <Text className="text-white font-semibold">{t("vendor.home.retry")}</Text>
                      </Button>
                    </View>
                  ) : ordersData?.items.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-muted-foreground">{t("vendor.home.no_recent_orders")}</Text>
                    </View>
                  ) : (
                    <ScrollView className="max-h-[400px]">
                      {ordersData?.items.map((order) => (
                        <OrderCard
                          key={order.order_id}
                          order={order}
                          showStatusEdit={false}
                          onPress={() => router.push(`/orders/${order.order_id}`)}
                        />
                      ))}
                    </ScrollView>
                  )}
                </Card>
              </View>
            </View>
          </View>
        ) : (
          // Mobile Layout (original)
          <View className="flex-1">
            <View className="p-4 flex-row justify-between items-center border-b border-border">
              <Text className="text-2xl font-bold text-foreground">{t("vendor.home.dashboard")}</Text>
              {/* <Button 
                variant="outline" 
                size="sm"
                onPress={() => router.push("/inbox")}
                className="flex-row items-center"
              >
                <MessageCircle size={16} className="text-foreground mr-2" />
                <Text className="text-sm text-foreground">Inbox</Text>
              </Button> */}
              <NotificationIcon />
            </View>
            <ScrollView className="flex-1">
              <View className="flex-row flex-wrap p-4 gap-4">
                <Card
                  className="flex-1 min-w-[160px] p-4"
                  {...brandStyles.successBorder()}
                  style={[{ borderWidth: 2 }]}
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <Banknote size={24} className="text-primary" color={resolvedColors.success} />
                  </View>
                  <Text className="text-2xl font-bold text-foreground mb-1">
                    TShs {stats.revenue.total.toLocaleString()}
                  </Text>
                  <Text className="text-sm text-muted-foreground">{t("vendor.home.total_revenue")}</Text>
                </Card>

                <Card className="flex p-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <Package size={24} className="text-green-500" color={resolvedColors.primary} />
                  </View>
                  <Text className="text-2xl font-bold text-foreground mb-1">
                    {stats.orders.total}
                  </Text>
                  <Text className="text-sm text-muted-foreground">{t("vendor.home.total_orders")}</Text>
                </Card>

                <Card className="p-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <Package size={24} className="text-primary" color={resolvedColors.primary} />
                  </View>
                  <Text className="text-2xl font-bold text-foreground mb-1">
                    {stats.products.total}
                  </Text>
                  <Text className="text-sm text-muted-foreground">{t("vendor.home.active_products")}</Text>
                </Card>
              </View>

              <View className="p-4 border-t-8 border-muted">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-foreground">
                    {t("vendor.home.revenue_overview")}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-4">
                  <Button
                    variant={selectedTimePeriod === "daily" ? "primary" : "outline"}
                    size="sm"
                    onPress={() => setSelectedTimePeriod("daily")}
                  >
                    <Text className={`text-xs ${selectedTimePeriod === "daily" ? "text-white" : "text-foreground"}`}>
                      {t("vendor.home.daily")}
                    </Text>
                  </Button>
                  <Button
                    variant={selectedTimePeriod === "weekly" ? "primary" : "outline"}
                    size="sm"
                    onPress={() => setSelectedTimePeriod("weekly")}
                  >
                    <Text className={`text-xs ${selectedTimePeriod === "weekly" ? "text-white" : "text-foreground"}`}>
                      {t("vendor.home.weekly")}
                    </Text>
                  </Button>
                  <Button
                    variant={selectedTimePeriod === "monthly" ? "primary" : "outline"}
                    size="sm"
                    onPress={() => setSelectedTimePeriod("monthly")}
                  >
                    <Text className={`text-xs ${selectedTimePeriod === "monthly" ? "text-white" : "text-foreground"}`}>
                      {t("vendor.home.monthly")}
                    </Text>
                  </Button>
                </View>

                {hasRevenueData ? (
                  <Card className="p-1">
                    <LineChart
                      data={revenueData}
                      width={screenWidth - 96}
                      chartConfig={chartConfig}
                      yAxisLabel="TShs "
                      formatYLabel={chartConfig.formatYLabel}
                    />
                  </Card>
                ) : (
                  <Card className="p-8 items-center justify-center">
                    <Package size={48} className="text-muted-foreground mb-4 opacity-50" color={resolvedColors.foreground} />
                    <Text className="text-lg font-semibold text-muted-foreground mb-2">
                      {t("vendor.home.no_sales_data")}
                    </Text>
                    <Text className="text-sm text-muted-foreground text-center">
                      {t("vendor.home.no_sales_message")}
                    </Text>
                  </Card>
                )}
              </View>

              <View className="p-4 border-t-8 border-muted">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-foreground">
                    {t("vendor.home.recent_orders")}
                  </Text>
                  <Button variant="link" onPress={() => router.push("/orders")}>
                    <Text className="text-sm font-semibold text-primary">
                      {t("vendor.home.see_all")}
                    </Text>
                  </Button>
                </View>

                {ordersLoading ? (
                  <View className="flex-1 justify-center items-center py-10">
                    <Text className="text-muted-foreground">{t("vendor.home.loading_orders")}</Text>
                  </View>
                ) : ordersError ? (
                  <View className="flex-1 justify-center items-center py-10">
                    <Text className="text-destructive mb-4">
                      {t("vendor.home.failed_to_load_orders")}
                    </Text>
                    <Button onPress={() => refetchOrders()}>
                      <Text className="text-white font-semibold">{t("vendor.home.retry")}</Text>
                    </Button>
                  </View>
                ) : ordersData?.items.length === 0 ? (
                  <View className="flex-1 justify-center items-center py-10">
                    <Text className="text-muted-foreground">{t("vendor.home.no_recent_orders")}</Text>
                  </View>
                ) : (
                  <View>
                    {ordersData?.items.map((order) => (
                      <OrderCard
                        key={order.order_id}
                        order={order}
                        showStatusEdit={false}
                      />
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </DesktopLayoutWrapper>
  );
}