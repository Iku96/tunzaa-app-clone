import React from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/lib/useColorScheme";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export function ButtonColorTest() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const resolvedColors = useResolvedThemeColors();

  return (
    <View style={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Button Color Test - {colorScheme} mode
      </Text>

      <Button onPress={toggleColorScheme}>
        <Text>Toggle Theme</Text>
      </Button>

      <View style={{ gap: 12 }}>
        <Button variant="default">
          <Text>Default Button (text-background on bg-foreground)</Text>
        </Button>

        <Button variant="primary">
          <Text>Primary Button (tenant brand colors)</Text>
        </Button>

        <Button variant="secondary">
          <Text>Secondary Button (text-foreground)</Text>
        </Button>

        <Button variant="outline">
          <Text>
            Outline Button (text-foreground) - should have {colorScheme === "dark" ? "white" : "black"} text
          </Text>
        </Button>

        <Button variant="ghost">
          <Text>
            Ghost Button (text-foreground) - should have {colorScheme === "dark" ? "white" : "black"} text
          </Text>
        </Button>

        <Button variant="destructive">
          <Text>Destructive Button (text-destructive-foreground)</Text>
        </Button>

        <Button variant="link">
          <Text>Link Button (text-primary)</Text>
        </Button>
      </View>

      <View style={{ marginTop: 20, padding: 16, backgroundColor: "#f0f0f0" }}>
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
          Expected Behavior:
        </Text>
        <Text style={{ fontSize: 12 }}>
          • Default: Background color text on foreground background (uses text-background on bg-foreground){"\n"}
          • Primary: White text on tenant primary background (uses text-primary-foreground on bg-primary){"\n"}
          • Secondary: {colorScheme === "dark" ? "White" : "Black"} text on secondary background (uses text-foreground){"\n"}
          • Outline: {colorScheme === "dark" ? "White" : "Black"} text on transparent background (uses text-foreground){"\n"}
          • Ghost: {colorScheme === "dark" ? "White" : "Black"} text on transparent background (uses text-foreground){"\n"}
          • Destructive: White text on red background (uses text-destructive-foreground){"\n"}
          • Link: Primary color text (uses text-primary)
        </Text>
      </View>

      {resolvedColors && (
        <View style={{ marginTop: 20, padding: 16, backgroundColor: "#e0e0e0" }}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
            Current Theme Colors:
          </Text>
          <Text style={{ fontSize: 10 }}>
            foreground: {resolvedColors.foreground}{"\n"}
            primaryForeground: {resolvedColors.primaryForeground}{"\n"}
            secondaryForeground: {resolvedColors.secondaryForeground}{"\n"}
            background: {resolvedColors.background}{"\n"}
            primary: {resolvedColors.primary}
          </Text>
        </View>
      )}
    </View>
  );
}
