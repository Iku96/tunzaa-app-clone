import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import * as Burnt from "burnt";
import {
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useReferral } from "@/context/referral";
import { useInitiatePayment, useInitiatePaymentDirectly, useCheckPaymentStatus, paymentsApi } from "@/services/payments";
import { useCreateOrder } from "@/services/orders";
import { useGetOrder } from "@/services/orders";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentMethodSelector } from "@/components/payment";
import { getPaymentMethodsForCategory, getPaymentMethodName } from "@/config/payment-methods";
import { API_CONFIG } from "@/services/config";
import type { CreateOrderBody } from "@/services/types/orders";
import { ordersApi } from "@/services/orders";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface PaymentFormProps {
  orderId?: string;
  orderNumber?: string;
  amount: number;
  currency?: string;
  paymentCategory?: string;
  createOrderData?: CreateOrderBody;
  installmentId?: number;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailure?: (error: string) => void;
  onPaymentTimeout?: () => void;
  onRetry?: () => void;
  onContinue?: () => void;
  showContinueButton?: boolean;
  continueButtonText?: string;
  className?: string;
  isPaymentsEnabled?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  orderNumber,
  amount,
  currency = "TZS",
  paymentCategory = "tunzaa",
  createOrderData,
  installmentId,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentTimeout,
  onRetry,
  onContinue,
  showContinueButton = true,
  continueButtonText = "Continue",
  className = "",
  isPaymentsEnabled = true,
}) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { trackOrder, isReferralActive, getReferralInfo } = useReferral();
  const resolvedColors = useResolvedThemeColors();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "completed" | "failed" | "timeout">("idle");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(90);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(orderId || null);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(orderNumber || null);
  const [hasTrackedOrder, setHasTrackedOrder] = useState(false);
  const [isCashOnDelivery, setIsCashOnDelivery] = useState(false);

  const countdownRef = useRef<number | null>(null);

  // Get available payment methods for the selected category
  const availablePaymentMethods = getPaymentMethodsForCategory("tunzaa");

  // API hooks
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();
  const initiatePaymentDirectly = useInitiatePaymentDirectly();

  // Auto-select first method if only one is available
  useEffect(() => {
    if (availablePaymentMethods.length === 1 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(availablePaymentMethods[0].id);
    }
  }, [availablePaymentMethods, selectedPaymentMethod]);

  // First check payment status, then order details
  const { data: paymentStatusData, isError: paymentStatusError } = useCheckPaymentStatus(
    transactionId || "",
    paymentStatus === "pending" && !!transactionId
  );

  // Debug logging for payment status API calls
  useEffect(() => {
    if (paymentStatus === "pending" && transactionId) {
      // console.log("🔍 Starting payment status check with transaction ID:", transactionId);
      // console.log("🌐 Payment status API endpoint will be called: /payments/check-status/" + transactionId);
    }
  }, [paymentStatus, transactionId]);

  // Poll order details to check payment status (after status check)
  const { data: orderData, isError: orderError } = useQuery({
    queryKey: ["order", currentOrderId],
    queryFn: () => {
      if (!currentOrderId) return null;
      // console.log("🔄 Fetching order details for:", currentOrderId);
      return ordersApi.getOrder(currentOrderId);
    },
    enabled: paymentStatus === "pending" && !!currentOrderId,
    refetchInterval: () => {
      // console.log("⏱️ Refetch interval check - paymentStatus:", paymentStatus, "countdown:", countdown);

      // Stop polling if payment is completed/failed or if we've timed out
      if (paymentStatus !== "pending" || countdown <= 0) {
        // console.log("🛑 Stopping polling - status:", paymentStatus, "countdown:", countdown);
        return false;
      }

      // Check if payment is already completed to stop polling
      if (orderData?.payment_status?.toLowerCase() === "paid" ||
        orderData?.payment_status?.toLowerCase() === "completed") {
        // console.log("✅ Payment completed - stopping polling");
        return false;
      }

      return 6000; // Poll every 6 seconds
    },
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: 2000,
  });

  // Add debug logging for payment status data changes
  useEffect(() => {
    if (paymentStatusData) {
    }
  }, [paymentStatusData]);

  // Add debug logging for order data changes
  useEffect(() => {
    if (orderData) {

    }
  }, [orderData]);

  // Debug logging for query state changes
  useEffect(() => {
    const isPaymentStatusEnabled = paymentStatus === "pending" && !!transactionId;
    const isOrderQueryEnabled = paymentStatus === "pending" && !!currentOrderId;
  }, [paymentStatus, currentOrderId, transactionId]);

  // Handle payment status check errors
  useEffect(() => {
    if (paymentStatusError && paymentStatus === "pending") {
      // Continue with order polling - React Query handles retries automatically
    }
  }, [paymentStatusError, paymentStatus]);

  // Handle polling errors
  useEffect(() => {
    if (orderError && paymentStatus === "pending") {
      // Continue polling - React Query handles retries automatically
    }
  }, [orderError, paymentStatus]);

  // Cleanup countdown timer
  const cleanupCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // Start countdown timer when payment becomes pending
  useEffect(() => {
    if (paymentStatus === "pending" && !startTime) {
      const now = Date.now();
      setStartTime(now);
      setCountdown(90);

      countdownRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - now) / 1000);
        const remaining = Math.max(0, 90 - elapsed);
        setCountdown(remaining);

        if (remaining <= 0) {
          cleanupCountdown();
          setPaymentStatus("timeout");
          setError(t("payment.payment_timeout_message"));
          Burnt.toast({
            title: t("payment.payment_timeout"),
            message: t("payment.payment_timeout_message"),
            preset: "error",
            duration: 4,
          });
          onPaymentTimeout?.();
        }
      }, 1000);
    }

    // Cleanup when payment status changes away from pending
    if (paymentStatus !== "pending") {
      cleanupCountdown();
    }

    return () => {
      if (paymentStatus !== "pending") {
        cleanupCountdown();
      }
    };
  }, [paymentStatus, startTime, onPaymentTimeout]);

  // Handle order data response for payment status checking
  useEffect(() => {
    if (orderData && paymentStatus === "pending") {
      const paymentStatusLower = orderData.payment_status?.toLowerCase();

      switch (paymentStatusLower) {
        case "paid":
        case "completed":
          cleanupCountdown();
          setPaymentStatus("completed");

          // Track referral order if referral is active and not already tracked
          if (isReferralActive() && !hasTrackedOrder) {
            const referralInfo = getReferralInfo();

            trackOrder(orderData.order_id, orderData.totals?.total || amount)
              .then(() => {
                // console.log("Referral order tracked successfully");
                setHasTrackedOrder(true);
              })
              .catch(error => {
                console.error("Failed to track referral order:", error);
                // Don't fail the payment success flow if referral tracking fails
              });
          }

          Burnt.toast({
            title: t("payment.payment_successful"),
            message: t("payment.payment_processed"),
            preset: "done",
            duration: 4,
            haptic: "success",
          });
          onPaymentSuccess?.(transactionId!);
          break;
        case "failed":
        case "cancelled":
          cleanupCountdown();
          setPaymentStatus("failed");
          const errorMessage = orderData.payment_details?.notes || t("payment.payment_failed");
          setError(errorMessage);
          Burnt.toast({
            title: t("payment.payment_failed"),
            message: errorMessage,
            preset: "error",
            duration: 4,
          });
          onPaymentFailure?.(errorMessage);
          break;
        case "pending":
        case "processing":
          // Continue polling - React Query handles this automatically
          break;
        default:
          // Handle unknown status as pending
          break;
      }
    }
  }, [orderData, paymentStatus, transactionId, onPaymentSuccess, onPaymentFailure]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCountdown();
    };
  }, []);

  // Handle cash_on_delivery - create order without payment
  const handleCashOnDelivery = async () => {
    if (!createOrderData) {
      Burnt.toast({
        title: t("payment.order_error"),
        message: t("payment.order_info_unavailable"),
        preset: "error",
        duration: 3,
      });
      return;
    }

    setIsCreatingOrder(true);
    setError(null);

    try {
      const newOrder = await createOrder.mutateAsync(createOrderData);
      setCurrentOrderId(newOrder.order_id);
      setCurrentOrderNumber(newOrder.order_number);

      // Track referral order creation if referral is active
      if (isReferralActive() && !hasTrackedOrder) {
        const referralInfo = getReferralInfo();
        try {
          await trackOrder(newOrder.order_id, newOrder.totals?.total || amount);
          setHasTrackedOrder(true);
        } catch (error) {
          console.error("Failed to track referral order on creation:", error);
        }
      }

      setIsCashOnDelivery(true);
      setPaymentStatus("completed");
      onPaymentSuccess?.(newOrder.order_id);

      Burnt.toast({
        title: t("payment.order_created"),
        message: t("payment.order_created_message"),
        preset: "done",
        duration: 3,
      });
    } catch (error: any) {
      console.error("Order creation failed:", error);
      Burnt.toast({
        title: t("payment.order_error"),
        message: t("payment.failed_create_order"),
        preset: "error",
        duration: 4,
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber || !user?.user_id) {
      Burnt.toast({
        title: t("payment.missing_information"),
        message: t("payment.please_enter_phone"),
        preset: "error",
        duration: 3,
      });
      return;
    }

    // Validate phone number format
    const cleanedPhone = phoneNumber.replace(/\D/g, "");
    if (cleanedPhone.length < 9) {
      Burnt.toast({
        title: t("payment.invalid_phone_number"),
        message: t("payment.please_enter_valid_phone"),
        preset: "error",
        duration: 3,
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let orderNumberToUse = currentOrderNumber;

      // If we don't have an order number, create the order first
      if (!orderNumberToUse && createOrderData) {
        setIsCreatingOrder(true);

        const newOrder = await createOrder.mutateAsync(createOrderData);
        orderNumberToUse = newOrder.order_number;
        setCurrentOrderId(newOrder.order_id);
        setCurrentOrderNumber(newOrder.order_number);

        // Track referral order creation if referral is active
        if (isReferralActive() && !hasTrackedOrder) {
          const referralInfo = getReferralInfo();


          try {
            await trackOrder(newOrder.order_id, newOrder.totals?.total || amount);
            setHasTrackedOrder(true);
          } catch (error) {
            console.error("Failed to track referral order on creation:", error);
            // Don't fail the order creation if referral tracking fails
          }
        }

        setIsCreatingOrder(false);
      }

      if (!orderNumberToUse) {
        Burnt.toast({
          title: t("payment.order_error"),
          message: t("payment.order_info_unavailable"),
          preset: "error",
          duration: 3,
        });
        return;
      }

      // Format phone number: strip leading 0 and add +255
      let formattedPhone = cleanedPhone;
      if (formattedPhone.startsWith("0")) {
        formattedPhone = formattedPhone.slice(1);
      }
      formattedPhone = `+255${formattedPhone}`;

      let response;

      // Use different payment methods based on whether order has installments
      // if (installmentId) {
      // For installment orders, use direct payment initiation
      response = await initiatePayment.mutateAsync({
        orderId: orderNumberToUse,
        data: {
          customer_msisdn: formattedPhone,
        }
      });

      console.log("Payment initiation response:", JSON.stringify(response, null, 2));

      // Handle the direct payment response format - check for 200 OK
      if (response) {
        // Use the transactionID from the response if available, otherwise use order number
        const txnId = response.transactionID || orderNumberToUse;
        setTransactionId(txnId);
        setPaymentStatus("pending");
        setStartTime(null); // Reset start time for new polling session

        Burnt.toast({
          title: t("payment.payment_initiated"),
          message: t("payment.check_phone_prompt"),
          preset: "done",
          duration: 3,
        });
      } else {
        Burnt.toast({
          title: t("payment.payment_failed"),
          message: t("payment.failed_initiate_payment"),
          preset: "error",
          duration: 3,
        });
      }
      // } else {
      //   // For regular orders, use standard payment initiation
      //   console.log("Using standard payment initiation for regular order");
      //   response = await initiatePayment.mutateAsync({
      //     orderId: orderNumberToUse,
      //     data: {
      //       customer_msisdn: formattedPhone,
      //     },
      //   });

      //   console.log("Standard payment initiate response:", response);

      //   // Handle the standard payment response format - check for 200 OK
      //   if (response) {
      //     // Payment request was submitted successfully
      //     // Use the order number as the transaction ID for polling
      //     setTransactionId(orderNumberToUse);
      //     setPaymentStatus("pending");
      //     setStartTime(null); // Reset start time for new polling session

      //     console.log("✅ Payment initiated - starting order polling for:", currentOrderId);
      //     console.log("📊 Payment status set to: pending");

      //     Burnt.toast({
      //       title: "Payment Initiated",
      //       message: "Check your phone for USSD prompt",
      //       preset: "done",
      //       duration: 3,
      //     });
      //   } else {
      //     Burnt.toast({
      //       title: "Payment Failed",
      //       message: "Failed to initiate payment. Please try again.",
      //       preset: "error",
      //       duration: 3,
      //     });
      //   }
      // }
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      Burnt.toast({
        title: t("payment.payment_error"),
        message: t("payment.failed_initiate_payment"),
        preset: "error",
        duration: 4,
      });
      setIsCreatingOrder(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    setPaymentStatus("idle");
    setTransactionId(null);
    setError(null);
    setStartTime(null);
    setCountdown(90);
    onRetry?.();
  };

  const handleContinue = () => {
    onContinue?.();
  };

  return (
    <View className={className}>
      {/* Order Creation Progress */}
      {isCreatingOrder && (
        <Card className="mb-6">
          <View className="p-4 items-center">
            <Clock size={48} className="text-primary mb-4" />
            <Text className="text-lg font-semibold mb-2">
              {t("payment.creating_order")}
            </Text>
            <Text className="text-center text-muted-foreground mb-4">
              {t("payment.processing_order_details")}
            </Text>
            <View className="w-full bg-muted rounded-full h-2">
              <View
                className="bg-primary h-2 rounded-full animate-pulse"
                style={{ width: '70%' }}
              />
            </View>
          </View>
        </Card>
      )}

      {/* Payment Status */}
      {paymentStatus === "idle" && !isCreatingOrder && (
        <Card className="mb-6">
          <View className="p-4">
            {/* Show cash_on_delivery UI if payments disabled */}
            {paymentCategory === "cash_on_delivery" || !isPaymentsEnabled ? (
              <>
                <Text className="text-lg font-semibold mb-4">
                  {t("payment.cash_on_delivery")}
                </Text>
                <Text className="text-sm text-muted-foreground mb-4">
                  {t("payment.cash_on_delivery_description")}
                </Text>
                <Button
                  variant="primary"
                  onPress={handleCashOnDelivery}
                  disabled={isCreatingOrder || !createOrderData}
                  className="w-full"
                >
                  <Text className="text-foreground font-semibold">
                    {isCreatingOrder ? t("payment.creating_order") : t("payment.complete_order")}
                  </Text>
                </Button>
              </>
            ) : (
              <>
                <Text className="text-lg font-semibold mb-4">
                  {t("payment.enter_phone_number")}
                </Text>
                {selectedPaymentMethod && (
                  <View className="mb-4">
                    <Text className="text-sm text-muted-foreground mb-2">
                      {t("payment.selected_method")}
                    </Text>
                    <Badge variant="outline" className="self-start">
                      <Text className="text-sm">
                        {getPaymentMethodName(selectedPaymentMethod, t)}
                      </Text>
                    </Badge>
                  </View>
                )}
                <View className="flex-row items-center mb-4">
                  {/* <Phone size={20} className="text-muted-foreground mr-2" /> */}
                  <Input
                    placeholder={t("payment.phone_placeholder")}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    className="flex-1"
                  />
                </View>
                <Text className="text-sm text-muted-foreground mb-4">
                  {t("payment.mobile_money_prompt")}
                </Text>
                <Button
                  variant="primary"
                  onPress={handleInitiatePayment}
                  disabled={
                    isProcessing ||
                    isCreatingOrder ||
                    !phoneNumber ||
                    (!currentOrderId && !createOrderData)
                  }
                  className="w-full"
                >
                  <Text className="text-foreground font-semibold">
                    {isProcessing ? t("payment.processing") : t("payment.initiate_payment")}
                  </Text>
                </Button>
              </>
            )}
          </View>
        </Card>
      )}

      {paymentStatus === "pending" && (
        <Card className="mb-6">
          <View className="p-4 items-center">
            <Clock size={48} className="text-warning mb-4 pb-4" />
            <Text className="text-lg font-semibold mb-2 pt-4">
              {t("payment.payment_pending")}
            </Text>
            <Text className="text-center text-muted-foreground mb-4">
              {t("payment.check_phone_ussd")}
            </Text>
            <Badge variant="secondary" className="mb-3">
              <Text className="text-sm text-accent">
                {t("payment.transaction_id")} {transactionId}
              </Text>
            </Badge>

            {/* Countdown Timer */}
            <View className="items-center mb-3">
              <Text className="text-sm text-muted-foreground mb-1">
                {t("payment.auto_checking_status")}
              </Text>
              <View className="flex-row items-center bg-muted rounded-full px-3 py-1">
                <Clock size={16} className="text-warning mr-2" />
                <Text className="text-sm font-mono ml-2">
                  {Math.floor(countdown / 60)}:
                  {(countdown % 60).toString().padStart(2, "0")}
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground mt-1">
                {t("payment.timeout_in_seconds", { count: countdown })}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {paymentStatus === "completed" && (
        <Card className="mb-6">
          <View className="p-4 items-center">
            <CheckCircle2 size={48} className="text-success mb-4" color={resolvedColors.success} />
            <Text className="text-lg font-semibold text-success mb-2">
              {isCashOnDelivery ? t("payment.order_created") : t("payment.payment_successful")}
            </Text>
            <Text className="text-center text-muted-foreground mb-4">
              {isCashOnDelivery ? t("payment.order_created_message") : t("payment.payment_processed")}
            </Text>
            <Badge variant="outline">
              <Text className="text-sm text-foreground">
                {isCashOnDelivery ? `${t("payment.order_number")}:` : t("payment.transaction_id")} {isCashOnDelivery ? currentOrderNumber : transactionId}
              </Text>
            </Badge>
          </View>
        </Card>
      )}

      {paymentStatus === "failed" && (
        <Card className="mb-6">
          <View className="p-4 items-center">
            <XCircle size={48} className="text-destructive mb-4" />
            <Text className="text-lg font-semibold text-destructive mb-2">
              {t("payment.payment_failed")}
            </Text>
            <Text className="text-center text-muted-foreground mb-4">
              {error || t("payment.payment_failed_message")}
            </Text>
            <Button
              variant="outline"
              onPress={handleRetryPayment}
              className="mb-2"
            >
              <Text>{t("payment.try_again")}</Text>
            </Button>
          </View>
        </Card>
      )}

      {paymentStatus === "timeout" && (
        <Card className="mb-6">
          <View className="p-4 items-center">
            <Clock size={48} className="text-warning mb-4" color={resolvedColors.warning} />
            <Text className="text-lg font-semibold text-warning mb-2 pt-4">
              {t("payment.payment_timeout")}
            </Text>
            <Text className="text-center text-muted-foreground mb-4">
              {t("payment.payment_timeout_message")}
            </Text>
            <Badge variant="primary" className="mb-3">
              <Text className="text-sm">{t("payment.transaction_id")} {transactionId}</Text>
            </Badge>
            <Button
              variant="outline"
              onPress={handleRetryPayment}
              className="mb-2"
            >
              <Text>{t("payment.try_again")}</Text>
            </Button>
          </View>
        </Card>
      )}

      {/* Action Button */}
      {showContinueButton && (
        <View className="p-4">
          {paymentStatus === "completed" ||
            paymentStatus === "failed" ||
            paymentStatus === "timeout" ? (
            <Button variant="primary" onPress={handleContinue} className="w-full">
              <Text className="text-foreground font-semibold">
                {continueButtonText}
              </Text>
            </Button>
          ) : paymentStatus === "pending" ? (
            <View className="items-center">
              <Text className="text-sm text-muted-foreground">
                {t("payment.waiting_payment_confirmation")}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};