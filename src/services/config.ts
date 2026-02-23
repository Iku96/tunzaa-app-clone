/**
 * API Configuration for Tunzaa Backend
 * Connects to the multi-tenant REST API (v1)
 */
export const API_CONFIG = {
    BASE_URL:
        process.env.EXPO_PUBLIC_API_BASE_URL || "https://multi-tenant-api.tunzaa.co.tz/v1",
    DOCUMENT_UPLOAD_URL:
        process.env.EXPO_PUBLIC_DOCUMENT_UPLOAD_URL || "https://docs.afrizon.africa/api/documents",
    TENANT_ID:
        process.env.EXPO_PUBLIC_TENANT_ID || "429841b1-76a3-4d67-a5fc-1c61178bb6a7",
    APP_URL:
        process.env.EXPO_PUBLIC_APP_URL || "https://afrizon.africa",
    TIMEOUT: 30000,
    HEADERS: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    // Google Maps Configuration
    GOOGLE_MAPS_API_KEY: "AIzaSyDj0-dYOYHB4eHnwELuV2cnOSpjtVPliMk",
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    USER_DATA: "user_data",
    TENANT_CONFIG: "tenant_config",
    APP_LOGO_URL: "app_logo_url",
    THEME_CONFIG: "app_theme_config",
};
