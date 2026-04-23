import React from "react";
import { View, ScrollView } from "react-native";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react-native";
import { format, isToday, isPast, isFuture } from "date-fns";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface InstallmentTimelineProps {
  plan: {
    plan_id: string;
    name: string;
    description: string;
    total_amount: number;
    paid_amount: number;
    remaining_balance: number;
    payment_frequency: string;
    start_date: string;
    end_date: string;
    custom_interval?: number;
    status: string;
    installments: Array<{
      installment_id: number;
      installment_number: number;
      amount: number;
      due_date: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>;
  };
  onMakePayment: (installmentId: number, amount: number) => void;
  className?: string;
}

export const InstallmentTimeline: React.FC<InstallmentTimelineProps> = ({
  plan,
  onMakePayment,
  className = "",
}) => {
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();

  const getInstallmentStatus = (installment: any) => {
    const dueDate = new Date(installment.due_date);
    const today = new Date();
    
    if (installment.status === "COMPLETED") {
      return {
        status: "completed",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success",
        icon: CheckCircle2,
        label: t("payment.installment.paid"),
      };
    }
    
    if (installment.status === "FAILED") {
      return {
        status: "failed",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive",
        icon: AlertCircle,
        label: t("payment.installment.failed"),
      };
    }
    
    if (isToday(dueDate)) {
      return {
        status: "due",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning",
        icon: Clock,
        label: t("payment.installment.due_today"),
      };
    }
    
    if (isPast(dueDate)) {
      return {
        status: "overdue",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive",
        icon: AlertCircle,
        label: t("payment.installment.overdue"),
      };
    }
    
    return {
      status: "upcoming",
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
      borderColor: "border-muted",
      icon: Calendar,
      label: t("payment.installment.upcoming"),
    };
  };

  const getNextPaymentDue = () => {
    const pendingInstallments = plan.installments.filter(
      (inst) => inst.status === "PENDING"
    );
    
    if (pendingInstallments.length === 0) return null;
    
    // Sort by due date and get the earliest one
    const sortedPending = pendingInstallments.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
    
    return sortedPending[0];
  };

  const nextPayment = getNextPaymentDue();
  const completedInstallments = plan.installments.filter(
    (inst) => inst.status === "COMPLETED"
  ).length;
  const progressPercentage = (completedInstallments / plan.installments.length) * 100;

  return (
    <View className={className}>
      {/* Plan Overview */}
      <Card className="mb-6">
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              {t("payment.installment.payment_plan")}
            </Text>
            <Badge variant="secondary">
              <Text className="text-sm">{plan.status.toUpperCase()}</Text>
            </Badge>
          </View>
          
          <Text className="text-sm text-muted-foreground mb-4">
            {plan.description}
          </Text>
          
          {/* Progress Bar */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium text-foreground">
                {t("payment.installment.progress")}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {completedInstallments} {t("payment.installment.of")} {plan.installments.length} {t("payment.installment.payments")}
              </Text>
            </View>
            <View className="w-full bg-muted rounded-full h-2">
              <View
                className="bg-success h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
            <Text className="text-xs text-muted-foreground mt-1">
              {progressPercentage.toFixed(1)}% {t("payment.installment.complete")}
            </Text>
          </View>

          {/* Financial Summary */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-muted-foreground">{t("payment.installment.total_amount_label")}</Text>
              <Text className="text-lg font-bold text-foreground">
                TShs {plan.total_amount.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-muted-foreground">{t("payment.installment.paid")}</Text>
              <Text className="text-lg font-bold text-success">
                TShs {plan.paid_amount.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-muted-foreground">{t("payment.installment.remaining")}</Text>
              <Text className="text-lg font-bold text-warning">
                TShs {plan.remaining_balance.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Next Payment Due */}
      {nextPayment && (
        <Card className="mb-6">
          <View className="p-4">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {t("payment.installment.next_payment_due")}
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground">
                  {t("payment.installment.payment_number")}{nextPayment.installment_number}
                </Text>
                <Text className="text-lg font-bold text-foreground">
                  TShs {nextPayment.amount.toLocaleString()}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {t("payment.installment.due")} {format(new Date(nextPayment.due_date), "MMM d, yyyy")}
                </Text>
              </View>
              <Button
                variant="default"
                onPress={() => onMakePayment(nextPayment.installment_id, nextPayment.amount)}
              >
                <Text className="text-white font-semibold">{t("payment.pay_now")}</Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      {/* Installment Timeline */}
      <Card>
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            {t("payment.installment.payment_timeline")}
          </Text>
          
          <ScrollView>
            {plan.installments.map((installment, index) => {
              const statusInfo = getInstallmentStatus(installment);
              const StatusIcon = statusInfo.icon;
              
              return (
                <View key={installment.installment_id} className="mb-4">
                  <View className="flex-row items-center">
                    {/* Timeline connector */}
                    <View className="items-center mr-4">
                      <View
                        className={`w-8 h-8 rounded-full border-2 items-center justify-center ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                      >
                        <StatusIcon size={16} className={statusInfo.color} />
                      </View>
                      {index < plan.installments.length - 1 && (
                        <View className="w-0.5 h-8 bg-muted mt-2" />
                      )}
                    </View>
                    
                    {/* Installment details */}
                    <View className="flex-1 border border-border rounded-lg p-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold text-foreground">
                          {t("payment.installment.payment_number")}{installment.installment_number}
                        </Text>
                        <Badge variant="outline">
                          <Text className={`text-xs ${statusInfo.color}`}>
                            {statusInfo.label}
                          </Text>
                        </Badge>
                      </View>
                      
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-lg font-bold text-foreground">
                            TShs {installment.amount.toLocaleString()}
                          </Text>
                          <Text className="text-sm text-muted-foreground">
                            {t("payment.installment.due")} {format(new Date(installment.due_date), "MMM d, yyyy")}
                          </Text>
                        </View>
                        
                        {(statusInfo.status === "due" || statusInfo.status === "overdue") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => onMakePayment(installment.installment_id, installment.amount)}
                          >
                            <Text className="text-sm">{t("payment.pay_now")}</Text>
                          </Button>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Card>
    </View>
  );
}; 