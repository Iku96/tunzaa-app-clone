/**
 * API Configuration for Tunzaa Backend
 * Connects to the multi-tenant REST API (v1)
 */
export const API_CONFIG = {
    BASE_URL:
        process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.demo.tunzaa.co.tz/v1",
    DOCUMENT_UPLOAD_URL:
        process.env.EXPO_PUBLIC_DOCUMENT_UPLOAD_URL || "https://docs.afrizon.africa/api/documents",
    TENANT_ID:
        process.env.EXPO_PUBLIC_TENANT_ID || "90c9aad8-4201-4416-8af6-c5561b7e6b35",
    APP_URL:
        process.env.EXPO_PUBLIC_APP_URL || "https://afrizon.africa",
    TIMEOUT: 30000,
    HEADERS: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    // Google Maps Configuration — reads from .env
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    USER_DATA: "user_data",
    TENANT_CONFIG: "tenant_config",
    APP_LOGO_URL: "app_logo_url",
    THEME_CONFIG: "app_theme_config",
    LAST_PORTAL: "LAST_PORTAL",
};
