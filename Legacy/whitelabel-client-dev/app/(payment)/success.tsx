import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle2, Package, ArrowRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";

const SuccessScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();
  usePageTitle("Cart");
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-6">
        {/* Success Animation/Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-success/10 rounded-full items-center justify-center mb-4">
            <CheckCircle2 size={48} className="text-success" />
          </View>
          <Text className="text-2xl font-bold text-success text-center mb-2">
            {t("payment.payment_successful")}
          </Text>
          <Text className="text-lg text-muted-foreground text-center">
            {t("payment.order_placed")}
          </Text>
        </View>

        {/* Order Info */}
        <Card className="w-full mb-8">
          <View className="p-6 items-center">
            <Package size={32} className="text-primary mb-4" />
            <Text className="text-lg font-semibold text-foreground mb-2">
              {t("payment.order_confirmation")}
            </Text>
            {orderId && (
              <Text className="text-sm text-muted-foreground text-center mb-4">
                {t("payment.order_number")}: {orderId}
              </Text>
            )}
            <Text className="text-sm text-muted-foreground text-center">
              {t("payment.thank_you")}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="w-full gap-3">
          {orderId && (
            <Button
              variant="primary"
              onPress={() => router.push(`/orders/${orderId}`)}
              className="w-full"
            >
              <View className="flex-row items-center">
                <Text className="text-foreground font-semibold mr-2">
                  {t("payment.view_order")}
                </Text>
                <ArrowRight size={16} className="text-foreground" color={resolvedColors?.foreground} />
              </View>
            </Button>
          )}

          <Button
            variant="outline"
            onPress={() => router.push("/orders")}
            className="w-full"
          >
            <Text className="font-semibold">{t("orders.order_history")}</Text>
          </Button>

          <Button
            variant="ghost"
            onPress={() => router.push("/")}
            className="w-full"
          >
            <Text className="font-semibold">{t("payment.continue_shopping")}</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SuccessScreen;
