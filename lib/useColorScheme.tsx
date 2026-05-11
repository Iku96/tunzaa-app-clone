import { useColorScheme as useNativewindColorScheme } from "nativewind";

export function useColorScheme() {
  return {
    colorScheme: "light" as const,
    isDarkColorScheme: false,
    setColorScheme: () => {},
    toggleColorScheme: () => {},
  };
}
