import { View } from "react-native";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";

interface TunzaaPayment {
  status: string;
  amount: number;
}

interface TunzaaProgressProps {
  payments: TunzaaPayment[];
}

export const TunzaaProgress = ({ payments }: TunzaaProgressProps) => {
  const completedPayments = payments.filter(
    (p) => p.status === "completed"
  ).length;
  const progress = (completedPayments / payments.length) * 100;

  return (
    <View className="gap-2">
      <Progress value={progress} />
      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-primary" />
          <Text className="text-xs text-muted-foreground">
            {completedPayments} of {payments.length} payments completed
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {progress.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
};
