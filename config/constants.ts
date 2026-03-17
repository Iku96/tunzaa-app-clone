export const APP_CONSTANTS = {
  // Authentication
  OTP_LENGTH: 6,
  OTP_RESEND_TIMEOUT: 60, // seconds
  MIN_PASSWORD_LENGTH: 6,

  // Tanzania specific
  COUNTRY_CODE: "+255",
  COUNTRY_CODE_NUMERIC: "255",

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    TENANT_CONFIG: "tenant_config",
    THEME_CONFIG: "app_theme_config",
    LOGO_URL: "cached_logo_url",
  },

  // User roles
  USER_ROLES: {
    BUYER: "buyer",
    VENDOR: "vendor",
    DELIVERY: "delivery",
  } as const,

  // API Configuration
  API_TIMEOUT: 30000, // 30 seconds

  // Theme defaults
  DEFAULT_THEME: {
    primary: "#ED8936",
    secondary: "#4670bd",
    accent: "#E2E8F0",
    text: {
      primary: "#000000",
      secondary: "#666666",
    },
    background: {
      primary: "#FFFFFF",
      secondary: "#F5F5F5",
    },
    border: "#E5E5E5",
  },
};
