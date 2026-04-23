import React, { useState } from "react";
import { View, Modal, Alert, TextInput } from "react-native";
import { Shield, X, CheckCircle } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DeliveryOTPModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  isLoading?: boolean;
  orderId: string;
  deliveryId: string;
}

export const DeliveryOTPModal: React.FC<DeliveryOTPModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
  orderId,
  deliveryId,
}) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = () => {
    if (!otp.trim()) {
      Alert.alert("Error", "Please enter the OTP code");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Error", "OTP must be 6 digits");
      return;
    }

    onSubmit(otp);
  };

  const handleClose = () => {
    if (!isLoading) {
      setOtp("");
      onClose();
    }
  };

  const handleOTPChange = (text: string) => {
    // Only allow numeric input and limit to 6 digits
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericText);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <Card className="w-full max-w-md bg-background">
          <View className="p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-foreground">
                Delivery Confirmation
              </Text>
              <Button
                variant="ghost"
                size="icon"
                onPress={handleClose}
                disabled={isLoading}
              >
                <X size={24} className="text-foreground" />
              </Button>
            </View>

            {/* Icon and Description */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <Shield size={32} className="text-primary" />
              </View>
              
              <Text className="text-base text-center text-foreground mb-2">
                Enter the OTP code provided by the customer
              </Text>
              
              <Text className="text-sm text-center text-muted-foreground">
                This confirms that the delivery has been received by the customer
              </Text>
            </View>

            {/* Order Information */}
            <View className="bg-muted p-4 rounded-lg mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-muted-foreground">Order ID</Text>
                <Text className="text-sm font-medium">{orderId.slice(-8)}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">Delivery ID</Text>
                <Text className="text-sm font-medium">{deliveryId.slice(-8)}</Text>
              </View>
            </View>

            {/* OTP Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">
                Enter 6-digit OTP
              </Text>
              <Input
                value={otp}
                onChangeText={handleOTPChange}
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
                editable={!isLoading}
                autoFocus
              />
              <Text className="text-xs text-muted-foreground mt-1 text-center">
                Ask the customer for their delivery confirmation code
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text className="text-sm font-medium">Cancel</Text>
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onPress={handleSubmit}
                disabled={isLoading || otp.length !== 6}
              >
                <Text className="text-sm font-medium text-foreground">
                  {isLoading ? "Verifying..." : "Confirm Delivery"}
                </Text>
              </Button>
            </View>
          </View>
        </Card>
      </View> 
    </Modal>
  );
}; 