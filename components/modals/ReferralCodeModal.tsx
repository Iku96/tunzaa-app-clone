import React, { useState, useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { Gift, Check, X, Sparkles, Users, Heart } from "lucide-react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useApplyReferralCode } from "@/src/services/rewards";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/hooks/useI18n";

interface ReferralCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReferralCodeModal({
  isOpen,
  onClose,
  onSuccess,
}: ReferralCodeModalProps) {
  const { t } = useI18n();
  const [referralCode, setReferralCode] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { user } = useAuth();

  // Animation refs
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // API hooks
  const applyReferralMutation = useApplyReferralCode();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReferralCode("");
      setShowResults(false);
      setIsSuccess(false);
      setSuccessMessage("");
      // Reset animations
      bounceAnim.setValue(0);
      sparkleAnim.setValue(0);
      slideAnim.setValue(50);
      opacityAnim.setValue(0);
    }
  }, [isOpen]);

  // Success animation sequence
  const startSuccessAnimation = () => {
    setShowResults(true);
    
    // Slide up and fade in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation for success icon
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animation
    Animated.sequence([
      Animated.delay(500),
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!referralCode.trim()) {
      return;
    }

    if (!user?.user_id || !user?.tenant_id) {
      return;
    }

    try {
      const result = await applyReferralMutation.mutateAsync({
        referral_code: referralCode.trim(),
        referee_id: user.user_id,
        tenant_id: user.tenant_id,
      });

      setIsSuccess(true);
      setSuccessMessage(result.message);
      startSuccessAnimation();
      
      // Auto-close after success animation
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 3000);
    } catch (error) {
      setIsSuccess(false);
      setSuccessMessage("Failed to apply referral code. Please try again.");
      startSuccessAnimation();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const bounceScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sparkleRotation = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const renderContent = () => {
    if (showResults) {
      return (
        <Animated.View 
          className="items-center gap-6 py-8"
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          }}
        >
          <View className="relative items-center">
            <Animated.View
              style={{
                transform: [{ scale: bounceScale }],
              }}
              className={`w-20 h-20 rounded-full items-center justify-center ${
                isSuccess ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {isSuccess ? (
                <Check size={40} color="#16a34a" />
              ) : (
                <X size={40} color="#dc2626" />
              )}
            </Animated.View>
            
            {isSuccess && (
              <Animated.View
                style={{
                  position: 'absolute',
                  transform: [{ rotate: sparkleRotation }],
                  opacity: sparkleOpacity,
                }}
                className="w-24 h-24 items-center justify-center"
              >
                <Sparkles size={24} color="#fbbf24" />
              </Animated.View>
            )}
          </View>

          <View className="items-center gap-2">
            <Text className={`text-xl font-bold text-center ${
              isSuccess ? 'text-green-600' : 'text-red-600'
            }`}>
              {isSuccess ? t("referral.welcome_family") : t("referral.something_wrong")}
            </Text>
            <Text className="text-sm text-muted-foreground text-center px-4">
              {successMessage}
            </Text>
          </View>

          {isSuccess && (
            <View className="flex-row items-center gap-2 bg-green-50 px-4 py-3 rounded-full">
              <Heart size={16} color="#16a34a" fill="#16a34a" />
              <Text className="text-sm font-medium text-green-700">
                {t("referral.part_of_special")}
              </Text>
            </View>
          )}
        </Animated.View>
      );
    }

    return (
      <View className="gap-6">
        {/* Header */}
        <View className="items-center gap-4">
          <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center">
            <Users size={32} className="text-primary" />
          </View>
          <View className="items-center gap-2">
            <Text className="text-xl font-bold text-center">
              {t("referral.join_rewards")}
            </Text>
            <Text className="text-sm text-muted-foreground text-center px-4">
              {t("referral.enter_code_message")}
            </Text>
          </View>
        </View>

        {/* Input Section */}
        <View className="gap-3">
          <View className="gap-2">
            <Text className="text-sm font-medium">{t("referral.referral_code")}</Text>
            <Input
              value={referralCode}
              onChangeText={setReferralCode}
              placeholder="Enter your friend's referral code"
              autoCapitalize="characters"
              editable={!applyReferralMutation.isPending}
              className="text-center text-lg font-mono tracking-widest"
            />
          </View>
        </View>

        {/* Benefits */}
        <View className="bg-muted/50 p-4 rounded-lg gap-3">
          <View className="flex-row items-center gap-2">
            <Gift size={16} className="text-primary" />
            <Text className="text-sm font-semibold">What you'll get:</Text>
          </View>
          <View className="gap-2 ml-6">
            <Text className="text-sm text-muted-foreground">• Welcome bonus points</Text>
            <Text className="text-sm text-muted-foreground">• Exclusive member benefits</Text>
            <Text className="text-sm text-muted-foreground">• Earn points on every purchase</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (showResults) {
      return (
        <Button variant="secondary" onPress={handleSkip} className="w-full">
          <Text className="text-foreground font-semibold">
            {isSuccess ? "Continue" : "Close"}
          </Text>
        </Button>
      );
    }

    return (
      <View className="flex-row gap-x-3">
        <Button
          variant="secondary"
          onPress={handleSkip}
          disabled={applyReferralMutation.isPending}
          className="flex-1"
        >
          <Text className="font-semibold text-muted-foreground">Skip for now</Text>
        </Button>

        <Button
          variant="primary"
          disabled={
            !referralCode.trim() || 
            applyReferralMutation.isPending
          }
          onPress={handleSubmit}
          className="flex-1"
        >
          <Text className="text-foreground font-semibold">
            {applyReferralMutation.isPending ? "Applying..." : "Apply Code"}
          </Text>
        </Button>
      </View>
    );
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onClose}
      title={showResults ? "" : "Welcome Bonus! 🎉"}
      snapPoints={["80%"]}
      footer={renderFooter()}
    >
      {renderContent()}
    </ResponsiveModal>
  );
} 