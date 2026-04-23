import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { useResponsive } from "@/hooks/useResponsive";

// Desktop-enhanced button with hover effects and keyboard navigation
interface DesktopEnhancedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function DesktopEnhancedButton({
  children,
  onPress,
  variant = "primary",
  className = "",
  disabled = false,
  size = "md",
}: DesktopEnhancedButtonProps) {
  const { isDesktop } = useResponsive();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return `bg-primary text-primary-foreground ${
          isHovered && isDesktop ? "bg-primary/90" : ""
        }`;
      case "secondary":
        return `bg-secondary text-secondary-foreground ${
          isHovered && isDesktop ? "bg-secondary/90" : ""
        }`;
      case "outline":
        return `border border-input bg-background ${
          isHovered && isDesktop ? "bg-accent" : ""
        }`;
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "md":
        return "px-4 py-2 text-base";
      case "lg":
        return "px-6 py-3 text-lg";
      default:
        return "px-4 py-2 text-base";
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (isFocused && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onPress();
        }
      };

      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isFocused, onPress]);

  if (Platform.OS !== "web") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`rounded-md ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`
        rounded-md transition-all duration-200 cursor-pointer
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${isFocused ? "ring-2 ring-ring ring-offset-2" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      style={{ outline: "none" }}
      accessibilityRole="button"
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </Pressable>
  );
}

// Desktop-enhanced card with hover effects
interface DesktopEnhancedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  hoverable?: boolean;
  elevated?: boolean;
}

export function DesktopEnhancedCard({
  children,
  onPress,
  className = "",
  hoverable = false,
  elevated = false,
}: DesktopEnhancedCardProps) {
  const { isDesktop } = useResponsive();
  const [isHovered, setIsHovered] = useState(false);

  const getCardStyles = () => {
    let styles = "rounded-lg border bg-card text-card-foreground";
    
    if (elevated) {
      styles += " shadow-lg";
    } else {
      styles += " shadow-sm";
    }

    if (hoverable && isDesktop) {
      styles += ` transition-all duration-200 ${
        isHovered ? "shadow-lg transform scale-[1.02]" : ""
      }`;
    }

    if (onPress) {
      styles += " cursor-pointer";
    }

    return styles;
  };

  if (Platform.OS !== "web" || !onPress) {
    return (
      <View className={`${getCardStyles()} ${className}`}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      className={`${getCardStyles()} ${className}`}
    >
      {children}
    </Pressable>
  );
}

// Desktop-enhanced grid with responsive columns
interface DesktopEnhancedGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

export function DesktopEnhancedGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "gap-4",
  className = "",
}: DesktopEnhancedGridProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getGridColumns = () => {
    if (isDesktop) return `grid-cols-${columns.desktop}`;
    if (isTablet) return `grid-cols-${columns.tablet}`;
    return `grid-cols-${columns.mobile}`;
  };

  return (
    <View className={`grid ${getGridColumns()} ${gap} ${className}`}>
      {children}
    </View>
  );
}

// Desktop breadcrumb navigation
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DesktopBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function DesktopBreadcrumb({ items, className = "" }: DesktopBreadcrumbProps) {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  if (!isDesktop) return null;

  return (
    <View className={`flex-row items-center space-x-2 text-sm text-muted-foreground ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Text className="mx-2">/</Text>}
          {item.href ? (
            <TouchableOpacity onPress={() => router.push(item.href as any)}>
              <Text className="hover:text-foreground cursor-pointer">
                {item.label}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="font-medium text-foreground">{item.label}</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
} 