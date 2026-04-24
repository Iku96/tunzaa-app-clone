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
    IS_FIRST_TIME_BUYER: "IS_FIRST_TIME_BUYER",
    NEWLY_REGISTERED_USER: "newly_registered_user",
    TEMP_REGISTRATION_PASSWORD: "temp_registration_password",
    TEMP_ONBOARDING_SHOP_NAME: "TEMP_ONBOARDING_SHOP_NAME",
    TEMP_ONBOARDING_PHONE: "TEMP_ONBOARDING_PHONE",
    TEMP_ONBOARDING_DESCRIPTION: "TEMP_ONBOARDING_DESCRIPTION",
    TEMP_ONBOARDING_LOGO: "TEMP_ONBOARDING_LOGO",
    TEMP_ONBOARDING_COVER: "TEMP_ONBOARDING_COVER",
    TEMP_ONBOARDING_LOCATION: "TEMP_ONBOARDING_LOCATION",
    TEMP_ONBOARDING_FIRST_NAME: "TEMP_ONBOARDING_FIRST_NAME",
    TEMP_ONBOARDING_LAST_NAME: "TEMP_ONBOARDING_LAST_NAME",
    ONBOARDING_CACHE: "@tunzaa_onboarding_cache",
};
