import React from "react";
import { View } from "react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { RewardsCard } from "./RewardsCard";
import { useAuth } from "@/context/auth";

export function RewardsCardWrapper() {
  const { user } = useAuth();

  // Don't render if no user
  if (!user) {
    return null;
  }
  
  try {
    return <RewardsCard />;
  } catch (error) {
    console.error("Error rendering RewardsCard:", error);
    
    // Fallback UI
    return (
      <Card className="p-4 mb-4">
        <View className="items-center py-4">
          <Text className="text-sm text-muted-foreground text-center">
            Rewards temporarily unavailable
          </Text>
        </View>
      </Card>
    );
  }
} 