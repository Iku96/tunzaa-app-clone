import { useState } from "react";
import { View } from "react-native";
import * as Burnt from "burnt";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Terminal } from "@/lib/icons/Terminal";
import { useRequestPasswordReset, useConfirmPasswordReset } from "@/services/auth";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestResetMutation = useRequestPasswordReset();
  const confirmResetMutation = useConfirmPasswordReset();

  const handleSubmit = async () => {
    if (step === "request") {
      if (!email && !phoneNumber) {
        setError("Please enter either email or phone number");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await requestResetMutation.mutateAsync({
          email: email || undefined,
          phone_number: phoneNumber || undefined,
        });

        Burnt.toast({
          title: "Reset Requested",
          preset: "done",
          message: response.message || "Check your email or phone for the reset token",
          haptic: "success",
          duration: 2,
          from: "top",
        });

        setStep("confirm");
      } catch (err: any) {
        Burnt.toast({
          title: "Request Failed",
          preset: "error",
          message: err.message || "Unable to request password reset",
          haptic: "error",
          duration: 3,
          from: "top",
        });
        setError(err.message || "Failed to request password reset");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Confirm step
      if (!resetToken || !newPassword) {
        setError("Please enter the reset token and new password");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await confirmResetMutation.mutateAsync({
          email: email || undefined,
          phone_number: phoneNumber || undefined,
          reset_token: resetToken,
          new_password: newPassword,
        });

        Burnt.toast({
          title: "Password Updated",
          preset: "done",
          message: response.message || "Your password has been successfully updated",
          haptic: "success",
          duration: 2,
          from: "top",
        });

        onClose();
      } catch (err: any) {
        Burnt.toast({
          title: "Confirmation Failed",
          preset: "error",
          message: err.message || "Unable to confirm password reset",
          haptic: "error",
          duration: 3,
          from: "top",
        });
        setError(err.message || "Failed to confirm password reset");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderRequestStep = () => (
    <View className="gap-4">
      {error && (
        <Alert icon={Terminal} variant="destructive">
          <Text className="text-sm text-destructive">{error}</Text>
        </Alert>
      )}

      <View className="gap-2">
        <Text className="text-sm font-medium">Email (optional)</Text>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          editable={!isLoading}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium">Phone Number (optional)</Text>
        <Input
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          editable={!isLoading}
        />
      </View>
    </View>
  );

  const renderConfirmStep = () => (
    <View className="gap-4">
      {error && (
        <Alert icon={Terminal} variant="destructive">
          <Text className="text-sm text-destructive">{error}</Text>
        </Alert>
      )}

      <View className="gap-2">
        <Text className="text-sm font-medium">Reset Token</Text>
        <Input
          value={resetToken}
          onChangeText={setResetToken}
          placeholder="Enter the reset token"
          editable={!isLoading}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium">New Password</Text>
        <Input
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter your new password"
          secureTextEntry
          editable={!isLoading}
        />
      </View>
    </View>
  );

  const renderFooter = () => (
    <View className="flex-row gap-x-3">
      <Button
        variant="secondary"
        onPress={onClose}
        disabled={isLoading}
        className="flex-1"
      >
        <Text className="font-semibold text-muted-foreground">Cancel</Text>
      </Button>

      <Button
        onPress={handleSubmit}
        disabled={isLoading}
        className="flex-1"
      >
        <Text className="text-white font-semibold">
          {isLoading
            ? "Processing..."
            : step === "request"
            ? "Request Reset"
            : "Confirm Reset"}
        </Text>
      </Button>
    </View>
  );

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onClose}
      title={step === "request" ? "Reset Password" : "Confirm Reset"}
      snapPoints={["90%"]}
      footer={renderFooter()}
    >
      {step === "request" ? renderRequestStep() : renderConfirmStep()}
    </ResponsiveModal>
  );
}
