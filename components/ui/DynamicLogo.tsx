import React from "react";
import { Image, View, ActivityIndicator } from "react-native";
import { useTenantStore } from "@/stores/tenant";
import { useColorScheme } from "@/lib/useColorScheme";

interface DynamicLogoProps {
  className?: string;
  fallbackUri?: string;
  width?: number;
  height?: number;
}

export function DynamicLogo({
  className = "",
  fallbackUri = "https://raw.githubusercontent.com/stackblitz/logo/master/logo.png",
  width = 120,
  height = 40,
}: DynamicLogoProps) {
  const { tenant, isLoading } = useTenantStore();
  const { isDarkColorScheme } = useColorScheme();
  
  // Get the appropriate logo URL based on theme
  const logoUrlLight = tenant?.branding?.logoUrl;
  const logoUrlDark = tenant?.branding?.theme?.logo?.secondary || "https://edatesting.nyc3.cdn.digitaloceanspaces.com/edatesting/documents/1751484606780-Afrizon%20Logo%20Design1.png";
  
  // Use dark logo in dark mode, light logo in light mode
  const logoUrl = isDarkColorScheme ? logoUrlDark : logoUrlLight;

  if (isLoading) {
    return (
      <View
        className={`items-center justify-center border border-red-500 ${className}`}
        style={{ width, height }}
      >
        <ActivityIndicator size="small" color="#ED8936" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: logoUrl || fallbackUri }}
      className={className}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}
