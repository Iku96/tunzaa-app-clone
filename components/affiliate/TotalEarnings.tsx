import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Platform } from "react-native";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Wallet,
} from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface TotalEarningsProps {
  className?: string;
}

type TimePeriod = "7d" | "30d" | "90d" | "1y";

export const TotalEarnings: React.FC<TotalEarningsProps> = ({ className }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30d");

  const earningsData = {
    "7d": {
      total: 325.5,
      change: "+12.5%",
      isPositive: true,
      previousPeriod: 289.33,
      breakdown: [
        { date: "2024-01-01", amount: 45.2, label: "Mon" },
        { date: "2024-01-02", amount: 62.8, label: "Tue" },
        { date: "2024-01-03", amount: 38.5, label: "Wed" },
        { date: "2024-01-04", amount: 71.3, label: "Thu" },
        { date: "2024-01-05", amount: 55.9, label: "Fri" },
        { date: "2024-01-06", amount: 25.4, label: "Sat" },
        { date: "2024-01-07", amount: 26.4, label: "Sun" },
      ],
    },
    "30d": {
      total: 1450.75,
      change: "+8.3%",
      isPositive: true,
      previousPeriod: 1340.25,
      breakdown: [
        { date: "Week 1", amount: 425.2, label: "W1" },
        { date: "Week 2", amount: 380.5, label: "W2" },
        { date: "Week 3", amount: 315.8, label: "W3" },
        { date: "Week 4", amount: 329.25, label: "W4" },
      ],
    },
    "90d": {
      total: 4250.25,
      change: "+15.7%",
      isPositive: true,
      previousPeriod: 3675.5,
      breakdown: [
        { date: "Month 1", amount: 1450.75, label: "Jan" },
        { date: "Month 2", amount: 1320.5, label: "Feb" },
        { date: "Month 3", amount: 1479.0, label: "Mar" },
      ],
    },
    "1y": {
      total: 18750.8,
      change: "+22.4%",
      isPositive: true,
      previousPeriod: 15325.4,
      breakdown: [
        { date: "Q1", amount: 4250.25, label: "Q1" },
        { date: "Q2", amount: 4850.3, label: "Q2" },
        { date: "Q3", amount: 4675.5, label: "Q3" },
        { date: "Q4", amount: 4974.75, label: "Q4" },
      ],
    },
  };

  const currentData = earningsData[selectedPeriod];
  const maxAmount = Math.max(
    ...currentData.breakdown.map((item) => item.amount)
  );

  const formatCurrency = (amount: number) => {
    return `TShs ${amount.toLocaleString()}`;
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 3 Months";
      case "1y":
        return "Last 12 Months";
      default:
        return "Last 30 Days";
    }
  };

  const renderBarChart = () => {
    return (
      <View className="flex-row items-end justify-between h-32 mb-4">
        {currentData.breakdown.map((item, index) => {
          const height = (item.amount / maxAmount) * 100;
          const isHighest = item.amount === maxAmount;

          return (
            <View key={index} className="flex-1 items-center mx-1">
              <View
                className={`w-full rounded-t-md ${isHighest ? "bg-success" : "bg-primary"
                  }`}
                style={{
                  height: `${Math.max(height, 10)}%`,
                  minHeight: 8,
                }}
              />
              <Text className="text-xs text-muted-foreground mt-2">
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Wallet size={20} className="text-primary mr-2" />
          <Text className="text-lg font-semibold text-foreground">
            Total Earnings
          </Text>
        </View>

        <Select
          value={{
            value: selectedPeriod,
            label: getPeriodLabel(selectedPeriod),
          }}
          onValueChange={(option) =>
            setSelectedPeriod((option?.value as TimePeriod) || "30d")
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d" label="Last 7 Days">
              Last 7 Days
            </SelectItem>
            <SelectItem value="30d" label="Last 30 Days">
              Last 30 Days
            </SelectItem>
            <SelectItem value="90d" label="Last 3 Months">
              Last 3 Months
            </SelectItem>
            <SelectItem value="1y" label="Last 12 Months">
              Last 12 Months
            </SelectItem>
          </SelectContent>
        </Select>
      </View>

      {/* Responsive Two Column Layout */}
      <View className="flex-col md:flex-row gap-6">
        {/* LEFT COLUMN: Chart + Stats */}
        <View className="flex-1">
          {/* Total Earnings */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(currentData.total)}
            </Text>
            <View className="flex-row items-center">
              <View
                className={`flex-row items-center px-2 py-1 rounded-full ${currentData.isPositive ? "bg-success/10" : "bg-destructive/10"
                  }`}
              >
                {currentData.isPositive ? (
                  <ArrowUp size={12} className="text-success mr-1" />
                ) : (
                  <ArrowDown size={12} className="text-destructive mr-1" />
                )}
                <Text
                  className={`text-xs font-medium ${currentData.isPositive ? "text-success" : "text-destructive"
                    }`}
                >
                  {currentData.change}
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground ml-2">
                vs previous period
              </Text>
            </View>
          </View>

          {/* Chart */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-medium text-foreground">
                Earnings Breakdown
              </Text>
              <View className="flex-row items-center">
                <BarChart3 size={14} className="text-muted-foreground mr-1" />
                <Text className="text-xs text-muted-foreground">
                  {getPeriodLabel(selectedPeriod)}
                </Text>
              </View>
            </View>
            {renderBarChart()}
          </View>

          {/* Summary Stats */}
          <View className="bg-muted/50 rounded-lg p-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted-foreground">
                Average per period
              </Text>
              <Text className="text-sm font-medium text-foreground">
                {formatCurrency(currentData.total / currentData.breakdown.length)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted-foreground">
                Best performing
              </Text>
              <Text className="text-sm font-medium text-success">
                {formatCurrency(maxAmount)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Growth</Text>
              <Text
                className={`text-sm font-medium ${currentData.isPositive ? "text-success" : "text-destructive"
                  }`}
              >
                {formatCurrency(currentData.total - currentData.previousPeriod)}
              </Text>
            </View>
          </View>
        </View>
        {/* Divider (only on web/large screens) */}
        {Platform.OS === "web" && (
          <View className="w-px bg-border mx-4" />
        )}
        {/* RIGHT COLUMN: Details + Buttons */}
        <View className="flex-1 justify-between">
          {/* Detailed Breakdown */}
          <View className="mb-6 max-h-64">
            <Text className="text-sm font-medium text-foreground mb-3">
              Period Details
            </Text>
            <ScrollView className="max-h-40">
              {currentData.breakdown.map((item, index) => (
                <View key={index}>
                  <View className="flex-row items-center justify-between py-2">
                    <Text className="text-sm text-muted-foreground">
                      {item.date}
                    </Text>
                    <Text className="text-sm font-medium text-foreground">
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                  {index < currentData.breakdown.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => console.log("View detailed report")}
            >
              <Text className="text-primary">Detailed Report</Text>
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onPress={() => console.log("Export data")}
            >
              <View className="flex-row items-center justify-center">
                <Calendar size={16} className="text-primary-foreground mr-2" />
                <Text className="text-primary-foreground">Export</Text>
              </View>
            </Button>
          </View>
        </View>
      </View>
    </Card>
  );
};
