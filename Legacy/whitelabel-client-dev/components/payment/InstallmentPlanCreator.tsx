import React, { useState, useEffect } from "react";
import { View, ScrollView, Platform, Alert, Modal, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, ChevronRight, Phone, Clock, Check, CheckCircle2, XCircle, X } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addDays, isBefore, parseISO, isToday, differenceInDays } from "date-fns";
import { useAuth } from "@/context/auth";
import { useCreateInstallmentPlan, useUpdateInstallmentPlan } from "@/services/payments";
import { useCreateOrder } from "@/services/orders";
import { useGetBuyerProfile } from "@/services/buyers";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert as AlertComponent } from "@/components/ui/alert";
import { Terminal } from "@/lib/icons/Terminal";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { PhoneInput } from "@/components/PhoneInput";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { useI18n } from "@/hooks/useI18n";
import * as Burnt from "burnt";

interface InstallmentPlanCreatorProps {
  cartId: string;
  addressId: string;
  deliveryType: string;
  vehicleId?: string;
  partnerId?: string;
  deliveryCost: number;
  totalAmount: number;
  onPlanCreated?: (orderId: string, planId: string) => void;
}

interface PaymentFrequency {
  id: string;
  label: string;
  value: "daily" | "weekly" | "monthly" | "custom";
  interval?: number;
  description: string;
  minDaysRequired: number;
}

const paymentFrequencies: PaymentFrequency[] = [
  {
    id: "daily",
    label: "Every day",
    value: "daily",
    interval: 1,
    description: "Pay a small amount daily",
    minDaysRequired: 1
  },
  {
    id: "3days",
    label: "Every 3 days",
    value: "custom",
    interval: 3,
    description: "Pay every 3 days",
    minDaysRequired: 6
  },
  {
    id: "5days",
    label: "Every 5 days",
    value: "custom",
    interval: 5,
    description: "Pay every 5 days",
    minDaysRequired: 10
  },
  {
    id: "weekly",
    label: "Every week",
    value: "weekly",
    interval: 7,
    description: "Pay weekly",
    minDaysRequired: 14
  },
  {
    id: "2weeks",
    label: "Every 2 weeks",
    value: "custom",
    interval: 14,
    description: "Pay every 2 weeks",
    minDaysRequired: 28
  },
  {
    id: "monthly",
    label: "Every month",
    value: "monthly",
    interval: 30,
    description: "Pay monthly",
    minDaysRequired: 60
  },
  {
    id: "custom",
    label: "Custom",
    value: "custom",
    description: "Set your own payment interval",
    minDaysRequired: 2
  }
];

const InstallmentPlanCreator: React.FC<InstallmentPlanCreatorProps> = ({
  cartId,
  addressId,
  deliveryType,
  vehicleId,
  partnerId,
  deliveryCost,
  totalAmount,
  onPlanCreated
}) => {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const resolvedColors = useResolvedThemeColors();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStep, setMaxStep] = useState(3);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dateError, setDateError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCustomIntervalModal, setShowCustomIntervalModal] = useState(false);
  const [customInterval, setCustomInterval] = useState("");
  const [savedCustomInterval, setSavedCustomInterval] = useState<number | null>(null);

  // Payment plan state
  const [paymentPlan, setPaymentPlan] = useState<any>(null);
  const [planId, setPlanId] = useState<number | null>(null);
  const [planCreated, setPlanCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>("");
  const [createdPlanId, setCreatedPlanId] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [needsPhoneNumber, setNeedsPhoneNumber] = useState(false);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);

  // Phone input state
  const [selectedCountry, setSelectedCountry] = useState({
    name: "Tanzania",
    code: "+255",
    flag: "🇹🇿"
  });

  // Plan data
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<string>("");
  const [frequencyChanged, setFrequencyChanged] = useState(false);

  // API hooks
  const { data: buyerProfile } = useGetBuyerProfile(
    user?.user_id ?? "",
    !!user?.user_id
  );
  const createInstallmentPlan = useCreateInstallmentPlan();
  const updateInstallmentPlan = useUpdateInstallmentPlan();
  const createOrder = useCreateOrder();

  // Check if user has phone number and set up flow accordingly
  useEffect(() => {
    if (buyerProfile?.contact_phone) {
      const phone = buyerProfile.contact_phone;
      // Check if phone number is valid (not empty and has more than 5 digits)
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length >= 9) {
        setNeedsPhoneNumber(false);
        setMaxStep(3);
        // Prefill phone number
        let phoneToUse = cleanPhone;
        if (phoneToUse.startsWith('+255')) {
          phoneToUse = phoneToUse.substring(4);
        } else if (phoneToUse.startsWith('255')) {
          phoneToUse = phoneToUse.substring(3);
        } else if (phoneToUse.startsWith('0')) {
          phoneToUse = phoneToUse.substring(1);
        }
        setPhoneNumber(phoneToUse);
      } else {
        setNeedsPhoneNumber(true);
        setMaxStep(3);
      }
    } else {
      setNeedsPhoneNumber(true);
      setMaxStep(3);
    }
  }, [buyerProfile?.contact_phone]);

  const minDate = addDays(new Date(), 1);
  const maxDate = addDays(new Date(), 365);

  // Calculate available frequencies based on target date
  const getAvailableFrequencies = () => {
    if (!targetDate) return paymentFrequencies;
    
    const startDate = new Date();
    const daysDiff = differenceInDays(targetDate, startDate);
    
    return paymentFrequencies.filter(frequency => {
      if (frequency.id === "custom") return true; // Always allow custom
      const minPayments = 2;
      const maxPayments = Math.floor(daysDiff / frequency.interval!);
      return maxPayments >= minPayments;
    });
  };

  const availableFrequencies = getAvailableFrequencies();

  // Helper function to get user-friendly frequency text
  const getFrequencyText = (frequency: string, customInterval?: number) => {
    switch (frequency) {
      case "daily":
        return "every day";
      case "weekly":
        return "every week";
      case "monthly":
        return "every month";
      case "custom":
        if (!customInterval) return "periodically";
        if (customInterval === 1) return "every day";
        if (customInterval === 7) return "every week";
        if (customInterval === 14) return "every 2 weeks";
        if (customInterval === 30) return "every month";
        return `every ${customInterval} days`;
      default:
        return "periodically";
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    setDateError("");

    if (!selectedDate) return;

    if (isBefore(selectedDate, minDate)) {
      setDateError("Please select a future date");
      return;
    }

    setTargetDate(selectedDate);
    
    // Reset selected frequency if it's no longer available
    if (selectedFrequency && selectedFrequency !== "custom") {
      const isStillAvailable = availableFrequencies.some(f => f.id === selectedFrequency);
      if (!isStillAvailable) {
        setSelectedFrequency("");
      }
    }
    
    // Validate custom interval if it's selected
    if (selectedFrequency === "custom" && savedCustomInterval) {
      const daysDiff = differenceInDays(selectedDate, new Date());
      if (savedCustomInterval >= daysDiff) {
        setSelectedFrequency("");
        setSavedCustomInterval(null);
      }
    }
  };

  const handleCustomIntervalSubmit = () => {
    const interval = parseInt(customInterval);
    if (interval < 1 || interval > 365) {
      setError("Please enter a valid interval between 1 and 365 days");
      return;
    }
    if (!targetDate) {
      setError("Please select a target date first");
      return;
    }
    
    const daysDiff = differenceInDays(targetDate, new Date());
    if (interval >= daysDiff) {
      setError("Payment interval must be less than the total days to target date");
      return;
    }

    setSelectedFrequency("custom");
    setSavedCustomInterval(interval);
    setShowCustomIntervalModal(false);
    setCustomInterval("");
    setError(null);
  };

  const createPlan = async () => {
    if (!targetDate || !user || !buyerProfile) {
      setError("Missing required information");
      return;
    }

    // Validate phone number
    let phoneToUse = phoneNumber;
    if (needsPhoneNumber) {
      const cleanedPhone = phoneNumber.replace(/\D/g, "");
      if (cleanedPhone.length < 9) {
        setError("Please enter a valid phone number");
        return;
      }
      if (cleanedPhone.startsWith("0")) {
        phoneToUse = cleanedPhone.slice(1);
      }
    }
    const fullPhoneNumber = `+255${phoneToUse}`;

    setIsLoading(true);
    setError(null);

    try {
      // Extract first and last name from user.name
      const nameParts = user.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";

      // Get frequency details
      const frequency = selectedFrequency === "custom" 
        ? { id: "custom", value: "custom" as const, interval: savedCustomInterval || 7 }
        : paymentFrequencies.find((f) => f.id === selectedFrequency);

      // Safely check for delivery_address array before accessing
      if (!buyerProfile.delivery_address || !Array.isArray(buyerProfile.delivery_address)) {
        setError("Address not found. Please go back and select an address.");
        return;
      }

      // Get selected address details
      const selectedAddress = buyerProfile.delivery_address.find(
        (addr) => addr.address_id === addressId
      );

      if (!selectedAddress) {
        setError("Address not found. Please go back and select an address.");
        return;
      }

      const installmentData = {
        customer: {
          first_name: firstName,
          last_name: lastName,
          phone: fullPhoneNumber,
          address: selectedAddress.address_line1 + ", " + selectedAddress.city,
        },
        name: `Cart ${cartId} Payment Plan`,
        description: `Installment plan for cart ${cartId}`,
        total_amount: totalAmount,
        payment_frequency: frequency?.value || "weekly",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(targetDate, "yyyy-MM-dd"),
        custom_interval: frequency?.interval,
      };

      // Create or update the installment plan
      let planResponse;
      if (planId && frequencyChanged) {
        // Update existing plan
        planResponse = await updateInstallmentPlan.mutateAsync({
          planId,
          data: installmentData
        });
        setFrequencyChanged(false);
      } else {
        // Create new plan
        planResponse = await createInstallmentPlan.mutateAsync(installmentData);
      }

      // Store the plan data
      setPaymentPlan(planResponse);
      setPlanId(planResponse.plan.plan_id);

      // Move to next step to show the plan
      setCurrentStep(currentStep + 1);

    } catch (error: any) {
      console.error("Failed to create/update installment plan:", error);
      setError("Failed to create payment plan. Please try again.");
      Burnt.toast({
        title: "Failed to create payment plan",
        message: "Please try again.",
        preset: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1 && !targetDate) {
      setDateError("Please select a target date");
      return;
    }
    if (currentStep === 2 && !selectedFrequency) {
      setError("Please select a payment frequency");
      return;
    }
    if (currentStep === 2 && selectedFrequency === "custom" && !savedCustomInterval) {
      setShowCustomIntervalModal(true);
      return;
    }

    setError(null);

    // Move from step 1 to step 2 if target date is selected
    if (currentStep === 1 && targetDate) {
      setCurrentStep(2);
      return;
    }

    // After step 2, automatically create plan if user has phone number
    if (currentStep === 2 && !needsPhoneNumber) {
      await createPlan();
      return;
    }

    // Handle phone number step
    if (currentStep === 2 && needsPhoneNumber) {
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3 && needsPhoneNumber) {
      if (!phoneNumber) {
        setError("Please enter your phone number");
        return;
      }
      if (phoneNumber.replace(/\D/g, "").length < 9) {
        setError("Please enter a valid phone number");
        return;
      }
      await createPlan();
      return;
    }

  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleFrequencyChange = (frequencyId: string) => {
    if (frequencyId === "custom") {
      setShowCustomIntervalModal(true);
      return;
    }
    
    // Check if frequency actually changed
    if (selectedFrequency !== frequencyId) {
      setFrequencyChanged(true);
    }
    
    // Clear saved custom interval when switching to non-custom frequency
    setSavedCustomInterval(null);
    setSelectedFrequency(frequencyId);
  };

  const handleCreateOrder = async () => {
    if (!paymentPlan || !user || !buyerProfile) {
      setError("Missing required information");
      return;
    }

    // Safely check for delivery_address array before accessing
    if (!buyerProfile.delivery_address || !Array.isArray(buyerProfile.delivery_address)) {
      setError("Address not found. Please go back and select an address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract first and last name from user.name
      const nameParts = user.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";

      // Get selected address details
      const selectedAddress = buyerProfile.delivery_address.find(
        (addr) => addr.address_id === addressId
      );

      if (!selectedAddress) {
        setError("Address not found. Please go back and select an address.");
        return;
      }

      const fullPhoneNumber = `+255${phoneNumber}`;

      const orderData = {
        cart_id: cartId,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address_line1: selectedAddress.address_line1,
          // address_line2: selectedAddress.address_line2 || "",
          city: selectedAddress.city,
          state_province: selectedAddress.state_province,
          // postal_code: selectedAddress.postal_code || "",
          country: selectedAddress.country,
          phone: fullPhoneNumber,
          email: buyerProfile.contact_email || user.email || "",
          is_default: selectedAddress.address_id === buyerProfile.default_delivery_address,
          latitude: selectedAddress.lat || '',
          longitude: selectedAddress.lng || '',
        },
        delivery_details: {
          partner_id: (partnerId as string) || (vehicleId as string) || "",
          cost: deliveryCost,
        },
        payment_details: {
          method: "tunzaa",
          amount: totalAmount,
          currency: "TZS",
          payment_gateway: "tunzaa",
          notes: `Installment plan ID: ${paymentPlan.plan.plan_id}`,
          installment_plan_id: paymentPlan.plan.plan_id,
        },
        plan_id: paymentPlan.plan.plan_id.toString(),
        user_id: user.user_id,
        delivery_type_id: deliveryType,
        notes: "Order created with installment payment plan",
      };

      const order = await createOrder.mutateAsync(orderData);

      // Set success state
      setPlanCreated(true);
      setCreatedOrderId(order.order_id);
      setCreatedOrderNumber(order.order_number);
      setCreatedPlanId(String(paymentPlan.plan.plan_id));

      // Show success toast
      Burnt.toast({
        title: "Payment Plan Created!",
        message: "Your installment plan has been created successfully.",
        preset: "done",
      });

    } catch (error: any) {
      console.error("Failed to create order:", error);
      setError("Failed to create order. Please try again.");
      Burnt.toast({
        title: "Failed to create order",
        message: "Please try again.",
        preset: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Payment handling functions
  const handleStartPaymentNow = () => {
    setShowPaymentForm(true);
  };

  const handleContinueBrowsing = () => {
    // Call the original callback to navigate to payment page
    if (onPlanCreated) {
      onPlanCreated(createdOrderId, createdPlanId);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center items-center mb-6">
      {Array.from({ length: maxStep }, (_, index) => index + 1).map((step) => (
        <View key={step} className="flex-row items-center">
          <View
            style={currentStep >= step ? {
              backgroundColor: resolvedColors.primaryWithOpacity(0.8),
            } : {
              backgroundColor: resolvedColors.mutedWithOpacity(0.8),
            }}
            className={`w-8 h-8 rounded-full items-center justify-center`}
          >
            <Text
              className={`text-sm font-semibold ${
                currentStep >= step ? "text-white" : "text-muted-foreground"
              }`}
            >
              {step}
            </Text>
          </View>
          {step < maxStep && (
            <View
              className={`w-8 h-0.5 mx-2 ${
                currentStep > step ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Card className="mb-6">
      <View className="p-4">
        <Text className="text-lg font-semibold text-foreground mb-4">
          When would you like to complete your payments?
        </Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Set a target date for when you want to finish paying for your order.
        </Text>
        
        <Button
          variant="outline"
          className="w-full flex-row justify-between items-center p-4"
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} className="text-muted-foreground" />
          <Text className="flex-1 text-base text-muted-foreground mx-3">
            {targetDate
              ? format(targetDate, "MMMM d, yyyy")
              : "Select target date"}
          </Text>
          <ChevronRight size={20} className="text-muted-foreground" />
        </Button>

        {Platform.OS === "web" ? (
          <>
            <input
              type="date"
              min={format(minDate, "yyyy-MM-dd")}
              max={format(maxDate, "yyyy-MM-dd")}
              onChange={(e) => handleDateChange(null, new Date(e.target.value))}
              className="mt-2 p-3 rounded-lg border border-border text-base w-full"
            />
          </>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={targetDate || new Date()}
              mode="date"
              minimumDate={minDate}
              maximumDate={maxDate}
              onChange={handleDateChange}
            />
          )
        )}

        {dateError && (
          <Text className="text-sm text-destructive mt-2">{dateError}</Text>
        )}
      </View>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="mb-6">
      <View className="p-4">
        <Text className="text-lg font-semibold text-foreground mb-4">
          How often would you like to make payments?
        </Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Choose a payment frequency that works best for you.
        </Text>

        {availableFrequencies.length === 0 && targetDate && (
          <View className="p-4 bg-muted rounded-lg mb-4">
            <Text className="text-sm text-muted-foreground text-center">
              The selected date period is too short for any payment frequency. Please select a later date.
            </Text>
          </View>
        )}

        <View className="flex-row flex-wrap gap-3">
          {availableFrequencies.map((frequency) => {
            const isSelected = selectedFrequency === frequency.id;
            const displayLabel = frequency.id === "custom" && isSelected && savedCustomInterval
              ? `Every ${savedCustomInterval} days`
              : frequency.label;
            return (
              <Button
                size="sm"
                key={frequency.id}
                variant={isSelected ? "secondary" : "outline"}
                className={`flex-1 min-w-[120px] h-16 justify-center items-center relative`}
                onPress={() => handleFrequencyChange(frequency.id)}
                style={
                  isSelected && resolvedColors
                    ? {
                        backgroundColor: resolvedColors.primaryWithOpacity(0.1),
                        borderColor: resolvedColors.primary,
                        borderWidth: 2,
                      }
                    : {}
                }
              >
                <View className="items-center">
                  {/* Radio button indicator */}
                  <View 
                    className={`w-4 h-4 rounded-full border-2 mt-2 items-center justify-center ${
                      isSelected ? 'border-primary' : 'border-muted-foreground'
                    }`}
                    style={
                      isSelected && resolvedColors
                        ? { 
                            borderColor: resolvedColors.primary,
                            backgroundColor: resolvedColors.primary 
                          }
                        : {}
                    }
                  >
                    {isSelected && (
                      <View 
                        className="w-2 h-2 rounded-full bg-white"
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                    )}
                  </View>
                  <Text 
                    className="text-xs font-semibold text-center mt-1 mb-2"
                    style={
                      isSelected && resolvedColors
                        ? { color: resolvedColors.primary }
                        : {}
                    }
                  >
                    {displayLabel}
                  </Text>
                </View>
              </Button>
            );
          })}
        </View>

        {targetDate && availableFrequencies.length > 0 && (
          <View className="mt-4 p-3 bg-muted rounded-lg">
            <Text className="text-xs text-muted-foreground text-center">
              Based on your selected date ({format(targetDate, "MMM d, yyyy")}), 
              you can make {availableFrequencies.length} different payment frequency choices.
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderStep3 = () => {
    // If we need phone number, show phone input
    if (needsPhoneNumber) {
      return (
        <Card className="mb-6">
          <View className="p-4">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Contact Information
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Enter your phone number for payment notifications and plan updates.
            </Text>

            <PhoneInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              label="Phone Number"
              required={true}
            />
          </View>
        </Card>
      );
    }

    // Otherwise show payment plan preview
    return (
      <>
        {paymentPlan && (
          <>
            {/* Congratulations Message */}
            <Card className="mb-6">
              <View className="p-6">
                <CheckCircle2 size={48} className="text-success mb-4 mx-auto" />
                <Text className="text-xl font-bold text-foreground text-center mb-4">
                  Congratulations {user?.name.split(' ')[0]}!
                </Text>
                <Text className="text-base text-foreground text-center mb-6">
                  Your payment plan is ready. You will pay{' '}
                  <Text className="font-bold text-success">
                    TShs {parseFloat(paymentPlan.installments[0].amount).toLocaleString()}
                  </Text>
                  {' '}{getFrequencyText(paymentPlan.plan.payment_frequency, paymentPlan.plan.custom_interval)} to achieve your goal.
                </Text>
                
                {/* Quick Plan Summary */}
                <View className="bg-muted/50 rounded-lg p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-muted-foreground">Total Amount:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      TShs {parseFloat(paymentPlan.plan.total_amount).toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-muted-foreground">Number of Payments:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {paymentPlan.installments.length}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-muted-foreground">Target Date:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {format(new Date(paymentPlan.plan.end_date), "MMM d, yyyy")}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Payment Schedule Accordion */}
            <Card className="mb-6">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() => setShowPaymentSchedule(!showPaymentSchedule)}
              >
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    Payment Schedule
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {paymentPlan.installments.length} payments • Starting {format(new Date(paymentPlan.plan.start_date), "MMM d")}
                  </Text>
                </View>
                <ChevronRight 
                  size={20} 
                  className={`text-muted-foreground transition-transform ${
                    showPaymentSchedule ? 'rotate-90' : 'rotate-0'
                  }`}
                />
              </TouchableOpacity>
              
              {showPaymentSchedule && (
                <View className="border-t border-border">
                  <ScrollView style={{ maxHeight: 300 }} className="p-4">
                    {paymentPlan.installments.map((installment: any, index: number) => (
                      <View
                        key={installment.installment_id}
                        className={`flex-row justify-between items-center py-3 ${
                          index < paymentPlan.installments.length - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                            <Text className="text-xs font-semibold text-primary">
                              {installment.installment_number}
                            </Text>
                          </View>
                          <View>
                            <Text className="text-sm font-semibold text-foreground">
                              Payment {installment.installment_number}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                              Due {format(new Date(installment.due_date), "MMM d, yyyy")}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm font-bold text-foreground">
                          TShs {parseFloat(installment.amount).toLocaleString()}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Card>
          </>
        )}
      </>
    );
  };

  const renderCustomIntervalModal = () => (
    <Modal
      visible={showCustomIntervalModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCustomIntervalModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-background rounded-lg p-6 w-full max-w-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-foreground">Custom Payment Interval</Text>
            <TouchableOpacity onPress={() => setShowCustomIntervalModal(false)}>
              <X size={24} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-sm text-muted-foreground mb-4">
            Enter the number of days between each payment (1-365 days).
          </Text>
          
          <Input
            placeholder="Enter days (e.g., 10)"
            value={customInterval}
            onChangeText={setCustomInterval}
            keyboardType="numeric"
            className="mb-4"
          />
          
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={() => setShowCustomIntervalModal(false)}
              className="flex-1"
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="default"
              onPress={handleCustomIntervalSubmit}
              className="flex-1"
            >
              <Text className="text-white">Apply</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1">
      {error && (
        <AlertComponent icon={Terminal} variant="destructive" className="mb-4">
          <Text className="text-sm text-destructive">{error}</Text>
        </AlertComponent>
      )}

      {renderCustomIntervalModal()}

      {!planCreated ? (
        <>
          {renderStepIndicator()}

          <ScrollView className="flex-1">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View className="py-4 border-t border-border">
            <View className="flex-row gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onPress={handlePreviousStep}
                  className="flex-1"
                >
                  <Text>{t("common.previous")}</Text>
                </Button>
              )}
              
              {currentStep < maxStep || (currentStep === maxStep && !paymentPlan) ? (
                <Button
                  variant="default"
                  onPress={handleNextStep}
                  className="flex-1"
                  disabled={isLoading || (currentStep === 2 && availableFrequencies.length === 0)}
                >
                  <Text className="text-white font-semibold">
                    {isLoading ? t("payment.installment.creating_plan") : t("common.next")}
                  </Text>
                </Button>
              ) : (
                <Button
                  variant="default"
                  onPress={handleCreateOrder}
                  disabled={isLoading || !paymentPlan}
                  className="flex-1"
                >
                  <Text className="text-white font-semibold">
                    {isLoading ? t("payment.installment.creating_order") : t("payment.installment.place_order")}
                  </Text>
                </Button>
              )}
            </View>
          </View>
        </>
      ) : !showPaymentForm ? (
        // Success state with options
        <View className="flex-1 justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <View className="p-6 items-center">
              <CheckCircle2 size={64} className="text-success mb-4" />
              <Text className="text-xl font-bold text-foreground mb-2">
                Plan Created Successfully!
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-6">
                Your payment plan has been created successfully. You can start making payments now or continue browsing.
              </Text>
              
              <View className="w-full gap-3">
                <Button
                  variant="default"
                  onPress={handleStartPaymentNow}
                  className="w-full"
                >
                  <Text className="text-white font-semibold">Start Payment Now</Text>
                </Button>
                <Button
                  variant="outline"
                  onPress={handleContinueBrowsing}
                  className="w-full"
                >
                  <Text className="text-primary font-semibold">Continue Browsing</Text>
                </Button>
              </View>
            </View>
          </Card>
        </View>
      ) : (
        // Payment form
        <PaymentForm
          orderId={createdOrderId}
          orderNumber={createdOrderNumber}
          amount={paymentPlan?.installments?.[0]?.amount ? parseFloat(paymentPlan.installments[0].amount) : totalAmount}
          currency="TZS"
          paymentCategory="tunzaa"
          onPaymentSuccess={(transactionId) => {
            // console.log("First payment successful:", transactionId);
          }}
          onPaymentFailure={(error) => {
            // console.log("First payment failed:", error);
          }}
          onPaymentTimeout={() => {
            // console.log("First payment timeout");
          }}
          onRetry={() => {
            // console.log("Retrying first payment");
          }}
          onContinue={handleContinueBrowsing}
          showContinueButton={true}
          continueButtonText="Continue Browsing"
        />
      )}
    </View>
  );
};

export default InstallmentPlanCreator; 