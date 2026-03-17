import { useState, useEffect } from "react";
import { Platform, Dimensions } from "react-native";

export interface ResponsiveBreakpoints {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isWeb: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useResponsive(): ResponsiveBreakpoints {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get("window");
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const isWeb = Platform.OS === "web";
  const screenWidth = dimensions.width;
  const screenHeight = dimensions.height;

  // Define breakpoints (matching Tailwind CSS defaults)
  const isDesktop = screenWidth >= 1024; // lg breakpoint
  const isTablet = screenWidth >= 768 && screenWidth < 1024; // md to lg
  const isMobile = screenWidth < 768; // below md

  return {
    isDesktop,
    isTablet,
    isMobile,
    isWeb,
    screenWidth,
    screenHeight,
  };
}

// Utility function for responsive values
export function responsive<T>(
  mobileValue: T,
  tabletValue: T,
  desktopValue: T,
  breakpoints: ResponsiveBreakpoints
): T {
  if (breakpoints.isDesktop) return desktopValue;
  if (breakpoints.isTablet) return tabletValue;
  return mobileValue;
}

// Utility function for responsive classes
export function responsiveClass(
  mobileClass: string,
  tabletClass: string,
  desktopClass: string,
  breakpoints: ResponsiveBreakpoints
): string {
  const baseClass = mobileClass;
  const tabletAddition = breakpoints.isTablet ? ` ${tabletClass}` : "";
  const desktopAddition = breakpoints.isDesktop ? ` ${desktopClass}` : "";
  
  return `${baseClass}${tabletAddition}${desktopAddition}`;
} 