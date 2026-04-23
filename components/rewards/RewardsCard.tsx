import React, { useState } from "react";
import { View, Platform, Alert } from "react-native";
import {
  Gift,
  Copy,
  Plus,
  Coins,
  TrendingUp,
  Ticket,
  Star,
} from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { ShareButton } from "@/components/ui/share-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useUserBalance,
  useRewardConfig,
  useGenerateReferralCode,
  useReferralCode,
  useRedeemPoints,
  useApplyReferralCode,
  rewardsUtils,
} from "@/services/rewards";
import { useAuth } from "@/context/auth";
import { API_CONFIG } from "@/services/config";

export function RewardsCard() {
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  // // Navigation readiness check (similar to useRouting pattern)
  const { user, isLoading: isAuthLoading } = useAuth();


  // React Query hooks - only called after navigation is ready
  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useUserBalance({
    include_history: true,
    limit: 5,
  });

  const { data: config } = useRewardConfig();

  const {
    data: referralCode,
    isLoading: referralCodeLoading,
    error: referralCodeError,
    refetch: refetchReferralCode
  } = useReferralCode(!isAuthLoading && !!user?.user_id);

  const generateReferralMutation = useGenerateReferralCode();
  const applyReferralCodeMutation = useApplyReferralCode();
  const redeemPointsMutation = useRedeemPoints();

  // Helper functions (kept to avoid typescript errors if referenced, though we won't call them)
  const handleCopyToClipboard = async (text: string) => {
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(text);
        Alert.alert("Copied!", "Referral code copied to clipboard");
      } else {
        Alert.alert("Referral Code", `Your code: ${text}\n\nShare this with friends!`);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  const handleGenerateReferralCode = async () => {
    // ... logic
  };

  const handleApplyReferralCode = async () => {
    if (!referralCodeInput.trim() || !user?.user_id) return;

    setIsApplyingCode(true);
    try {
      const response = await applyReferralCodeMutation.mutateAsync({
        referral_code: referralCodeInput.trim(),
        referee_id: user.user_id,
        tenant_id: user.tenant_id || API_CONFIG.TENANT_ID,
      });

      if (response.bonus_credited) {
        Alert.alert("Success", "Referral code applied! Bonus points credited.");
      } else {
        Alert.alert("Success", response.message || "Referral code applied successfully.");
      }
      setReferralCodeInput("");
      // Refresh balance to show new points if any
      refetchBalance();
    } catch (error: any) {
      console.error("Failed to apply referral code:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to apply referral code";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsApplyingCode(false);
    }
  };

  const handleRedeemPoints = async () => {
    console.log("Redeem clicked. Points:", pointsToRedeem, "User ID:", user?.user_id);

    if (!user?.user_id) {
      Alert.alert("Error", "User not found. Please try logging in again.");
      return;
    }

    if (!pointsToRedeem) {
      Alert.alert("Missing Amount", "Please enter the number of points to redeem.");
      return;
    }

    const points = parseInt(pointsToRedeem);
    if (isNaN(points) || points <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid number of points.");
      return;
    }

    if (!rewardsUtils.isValidRedemption(points, config?.redemption_points)) {
      Alert.alert("Invalid Amount", `Points must be a multiple of ${config?.redemption_points || 1}.`);
      return;
    }

    if (points > (balance?.balance || 0)) {
      Alert.alert("Insufficient Points", "You do not have enough points.");
      console.warn("Insufficient Points", "You do not have enough points.");
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await redeemPointsMutation.mutateAsync({
        points: points,
        user_id: user.user_id,
      });

      console.log("Points Redeemed Success:", response);
      setPointsToRedeem("");
      refetchBalance();
    } catch (error: any) {
      console.error("Redemption failed:", error);
      const errorMessage = error.apiError?.message || error.message || "Redemption failed";
      console.warn("Redemption Error:", errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  const getShareUrl = () => {
    if (!referralCode) return "";
    const baseUrl = Platform.OS === "web" ? window.location.origin : API_CONFIG.APP_URL;
    return `${baseUrl}/signup?ref=${referralCode.code}`;
  };

  const getShareMessage = () => {
    if (!referralCode) return "";
    return `Join Afrizon Marketplace, use the referral code ${referralCode.code}`;
  };
  // ISOLATION: Restore Header and Points Balance
  return (
    <View className="mb-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Header */}
      <View className="bg-primary p-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Gift size={24} className="text-white" />
          </View>
          <Text className="text-lg font-bold text-white">Rewards & Referrals</Text>
        </View>
        <Badge variant="outline" className="border-white/30">
          <Star size={12} className="text-white fill-white" />
          <Text className="text-xs text-white ml-2">Member</Text>
        </Badge>
      </View>

      <View className="p-4 gap-4">
        {/* Points Balance */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">Your Points</Text>

          <View className="flex-row items-center justify-between bg-muted/50 p-4 rounded-lg">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-foreground">
                {rewardsUtils.formatPoints(balance?.balance || 0)}
              </Text>
              <Text className="text-xs text-muted-foreground">Available Points</Text>
            </View>

            {(balance?.lifetime_earned !== undefined || balance?.lifetime_redeemed !== undefined) && (
              <View className="items-end gap-1">
                {balance?.lifetime_earned !== undefined && (
                  <View className="flex-row items-center gap-1">
                    <TrendingUp size={12} className="text-primary" />
                    <Text className="text-xs font-medium text-primary">
                      {rewardsUtils.formatPoints(balance.lifetime_earned)} earned
                    </Text>
                  </View>
                )}
                {balance?.lifetime_redeemed !== undefined && (
                  <Text className="text-xs text-muted-foreground">
                    {rewardsUtils.formatPoints(balance.lifetime_redeemed)} redeemed
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        <Separator />

        {/* Recent Transactions */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">Recent Transactions</Text>
          {balance?.history && balance.history.length > 0 ? (
            <View className="gap-1">
              {balance.history.map((transaction) => (
                <View
                  key={transaction.id}
                  className="bg-muted/10 p-3 rounded-lg flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-[10px] font-bold text-primary uppercase mb-0.5">
                      {transaction.transaction_type.replace("_", " ")}
                    </Text>
                    <Text className="text-xs text-foreground font-medium" numberOfLines={1}>
                      {transaction.description}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className={cn(
                        "text-sm font-bold",
                        transaction.points > 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {transaction.points > 0 ? "+" : ""}
                      {transaction.points}
                    </Text>
                    <Text className="text-[10px] text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-4 items-center bg-muted/20 rounded-lg">
              <Text className="text-xs text-muted-foreground italic">No recent transactions</Text>
            </View>
          )}
        </View>

        <Separator />

        {/* Referral Code Section */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-foreground">Your Referral Code</Text>
          </View>

          {referralCodeError ? (
            <View className="bg-red-50 p-4 rounded-lg items-center gap-2">
              <Text className="text-sm text-red-600 text-center">
                Error loading referral code. Please try again.
              </Text>
              <Button
                onPress={() => refetchReferralCode()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Text className="text-primary font-medium">Retry</Text>
              </Button>
            </View>
          ) : referralCode ? (
            <View className="bg-muted/30 border border-dashed border-primary/30 p-4 rounded-lg gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-mono font-bold text-foreground tracking-wider">
                    {referralCode.code}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Share this code with friends to earn {config?.referral_bonus_points || 50} points each!
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onPress={() => handleCopyToClipboard(referralCode.code)}
                    className="w-10 h-10"
                  >
                    <Copy size={16} className="text-primary" />
                  </Button>

                  <ShareButton
                    url={getShareUrl()}
                    title="Join me and earn rewards!"
                    message={getShareMessage()}
                    variant="primary"
                    size="icon"
                    className="w-10 h-10"
                    iconClassName="text-primary"
                  />
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-muted/30 p-4 rounded-lg items-center gap-2">
              <Text className="text-sm text-muted-foreground text-center">
                Generate your unique referral code to start earning bonus points!
              </Text>
              <Button
                variant="primary"
                onPress={handleGenerateReferralCode}
                disabled={generateReferralMutation.isPending}
                size="sm"
                className="mt-2 flex-row items-center justify-center"
              >
                <Plus size={16} className="text-black" />
                <Text className="text-foreground font-medium ml-1">
                  {generateReferralMutation.isPending ? "Generating..." : "Generate Code"}
                </Text>
              </Button>
            </View>
          )}
        </View>

        <Separator />

        {/* Apply Referral Code Section */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">Have a Referral Code?</Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                value={referralCodeInput}
                onChangeText={setReferralCodeInput}
                placeholder="Enter code (e.g. F4A6T5XQ)"
                autoCapitalize="characters"
                editable={!isApplyingCode}
              />
            </View>
            <Button
              variant="outline"
              onPress={handleApplyReferralCode}
              disabled={!referralCodeInput.trim() || isApplyingCode}
              className="px-6"
            >
              <Text className="text-primary font-medium">
                {isApplyingCode ? "Applying..." : "Apply"}
              </Text>
            </Button>
          </View>
        </View>

        <Separator />

        {/* Points Redemption */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-foreground">Redeem Points</Text>
            <View className="flex-row items-center gap-1">
              <Ticket size={12} className="text-primary" />
              <Text className="text-xs text-primary">
                {config?.redemption_points || 1} pts = {rewardsUtils.formatCurrency(config?.redemption_value_tzs || 1000)} coupon
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                value={pointsToRedeem}
                onChangeText={setPointsToRedeem}
                placeholder={`Min. ${config?.redemption_points || 1} points`}
                keyboardType="numeric"
                editable={!isRedeeming}
                className="text-center"
              />
              {pointsToRedeem && (
                <Text className="text-xs text-muted-foreground text-center mt-1">
                  Will get: {rewardsUtils.formatCurrency(
                    rewardsUtils.calculateCouponValue(
                      parseInt(pointsToRedeem) || 0,
                      config?.redemption_points,
                      config?.redemption_value_tzs
                    )
                  )} coupon
                </Text>
              )}
            </View>

            <Button
              variant="primary"
              onPress={handleRedeemPoints}
              disabled={isRedeeming}
              className="px-6 flex-row items-center justify-center"
            >
              <Coins size={16} color="white" />
              <Text className="text-white font-medium ml-1">
                {isRedeeming ? "Redeeming..." : "Redeem"}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </View >
  );
}