// Legacy color definitions - updated with Material Design 2 Dark Theme support
// Note: This is for backward compatibility. New components should use the theme context.
export const colors = {
  primary: {
    main: "#007AFF",
    light: "#4DA3FF",
    dark: "#0055B3",
  },
  secondary: "#F5F5F5",
  text: {
    primary: "#000000",
    secondary: "#666666",
    disabled: "#999999",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F5F5F5",
  },
  border: "#E5E5E5",
  error: "#FF4B4B",
  success: "#4CAF50", // Light mode success color
  info: "#03A9F4", // Light mode info color
  warning: "#FF9800", // Light mode warning color
  modalOverlay: "rgba(0, 0, 0, 0.5)",
};

// Dark mode variants following Material Design 2 guidelines
export const darkColors = {
  primary: {
    main: "#4F9BFF", // Lighter blue for dark theme
    light: "#7BB3FF", // Lighter variant
    dark: "#3B82F6", // Darker variant
  },
  secondary: "#2A2A2A", // Lighter: 16% instead of pure black
  text: {
    primary: "#FFFFFF",
    secondary: "#B3B3B3", // Lighter: 70% instead of 63%
    disabled: "#666666", // Lighter: 40% instead of 32%
  },
  background: {
    primary: "#1A1A1A", // Lighter: 10% instead of 0%
    secondary: "#2A2A2A", // Lighter: 16% instead of 10%
  },
  border: "#404040", // Lighter: 25% instead of 23%
  error: "#EF4444", // Lighter red for better visibility
  success: "#2E7D32", // Dark mode success color
  info: "#0288D1", // Dark mode info color
  warning: "#ED6C02", // Dark mode warning color
  modalOverlay: "rgba(0, 0, 0, 0.7)", // Slightly more opaque for dark theme
};
