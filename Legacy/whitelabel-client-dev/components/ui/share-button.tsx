import React from "react";
import { Platform, Share, Alert } from "react-native";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react-native";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface ShareButtonProps {
  url: string;
  title?: string;
  message?: string;
  variant?: "ghost" | "outline" | "default" | "primary";
  size?: "icon" | "sm" | "default" | "lg";
  className?: string;
  color?: string; // Color for the ico
  iconClassName?: string;
}

export function ShareButton({
  url,
  title = "Check this out!",
  message = "I found this interesting item",
  variant = "primary",
  size = "icon",
  className = "",
  color = 'white',
  iconClassName = "",
}: ShareButtonProps) {
  const resolvedThemeColors = useResolvedThemeColors();
  const handleShare = async () => {
    try {
      if (Platform.OS === "web") {
        // Web sharing using Web Share API
        if (navigator.share) {
          await navigator.share({
            title,
            text: message,
            url,
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          await navigator.clipboard.writeText(url);
          Alert.alert("Link copied!", "The link has been copied to your clipboard.");
        }
      } else {
        // Native sharing
        await Share.share({
          title,
          message: `${message}\n\n${url}`,
          url,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback: copy to clipboard
      if (Platform.OS === "web") {
        try {
          await navigator.clipboard.writeText(url);
          Alert.alert("Link copied!", "The link has been copied to your clipboard.");
        } catch (clipboardError) {
          console.error("Error copying to clipboard:", clipboardError);
        }
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onPress={handleShare}
    >
      <Share2 size={24}
        color={resolvedThemeColors?.foreground || "#000000"}
        // color={resolvedThemeColors.foregroundMuted}
        className={iconClassName} />
    </Button>
  );
} 