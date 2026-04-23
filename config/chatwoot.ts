// Chatwoot Configuration
// Replace these values with your actual Chatwoot instance details

export const chatwootConfig = {
  // Your Chatwoot instance URL (e.g., https://app.chatwoot.com or your self-hosted URL)
  baseUrl: "https://support.afrizon.africa",

  // Your website token from Chatwoot dashboard
  // To get this: Go to Settings -> Inboxes -> [Your Inbox] -> Settings -> Configuration
  websiteToken: "jn5LtxocshE4YWqTSdTMTWVS",

  // Default locale for the widget
  locale: "en",

  // Color scheme: 'light', 'dark', or 'auto'
  colorScheme: "auto" as const,

  // Enable debug mode for development
  enableDebug: __DEV__,

  // Custom attributes that will be sent with every conversation
  defaultCustomAttributes: {
    source: "mobile_app",
    version: "1.0.0",
  },
};

// Helper function to get user data for Chatwoot
export const getChatwootUser = (userEmail?: string, userName?: string, userId?: string) => {
  return {
    identifier: userId || userEmail || "anonymous",
    name: userName || "Support User",
    email: userEmail || undefined,
  };
};

// Helper function to get custom attributes
export const getChatwootCustomAttributes = (additionalAttributes?: Record<string, any>) => {
  return {
    ...chatwootConfig.defaultCustomAttributes,
    platform: require("react-native").Platform.OS,
    timestamp: new Date().toISOString(),
    ...additionalAttributes,
  };
}; 