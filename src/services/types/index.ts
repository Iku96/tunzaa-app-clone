/**
 * Tunzaa API Type Definitions
 * Types for auth, OTP, registration, vendor/delivery partner, and Firebase integration
 */

export type UserRole = "buyer" | "vendor" | "delivery" | "winga" | "super";

export interface Banner {
    banner_id: string;
    title: string;
    image_url: string;
    mobile_image_url: string | null;
    destination_url: string | null;
    alt_text: string;
    display_order: number;
    is_active: boolean;
    start_date: string;
    end_date: string;
}

export interface TenantResponse {
    id: string;
    name: string;
    domain: string;
    country_code: string;
    currency: string;
    languages: string[];
    admin_email: string;
    admin_phone: string;
    is_active: boolean;
    trial_ends_at: string;
    plan: string;
    modules: {
        payments: boolean;
        promotions: boolean;
        inventory: boolean;
    };
    branding: {
        logoUrl: string;
        theme: {
            logo: {
                primary: string;
                secondary: string | null;
                icon: string | null;
            };
            colors: {
                primary: string;
                secondary: string;
                accent: string;
                text: {
                    primary: string;
                    secondary: string;
                };
                background: {
                    primary: string;
                    secondary: string;
                };
                border: string;
            };
        };
    };
    banners: Banner[];
    metadata: {
        terms_conditions?: string;
        privacy_policy?: string;
        [key: string]: any;
    };
    createdAt: string;
    updatedAt: string;
}

// ---- OTP Types ----

export interface OTPRequestBody {
    phone_number: string;
}

export interface OTPRequestResponse {
    message: string;
    ttl: number;
}

export interface OTPVerifyBody {
    phone_number: string;
    otp: string;
}

export interface OTPVerifyResponse {
    message: string;
    verified: boolean;
}

// ---- Auth Types ----

export interface RegisterBody {
    first_name: string;
    last_name: string;
    email?: string;
    phone_number: string;
    password: string;
}

export interface LoginBody {
    identifier: string;
    password: string;
    is_phone?: boolean;
}

export interface PasswordResetRequestBody {
    email?: string;
    phone_number?: string;
}

export interface PasswordResetRequestResponse {
    message: string;
    phone_number?: string;
    email?: string;
    expires_at: string;
    ttl_seconds: number;
}

export interface PasswordResetConfirmBody {
    email?: string;
    phone_number?: string;
    reset_token: string;
    new_password: string;
}

export interface PasswordResetConfirmResponse {
    message: string;
    user_id: string;
}

export interface AuthResponse {
    message: string;
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string | null;
    phone_number: string;
    is_active?: boolean;
    is_verified: boolean;
    activeProfileRole: UserRole;
    active_profile_role: UserRole;
    profiles: Array<{
        profileId: string;
        profile_id: string;
        role: string;
        displayName: string | null;
        display_name: string | null;
        is_active: boolean;
        metadata: {
            terms_conditions?: string;
            privacy_policy?: string;
            [key: string]: any;
        };
    }>;
    created_at: string;
    updated_at: string;
    access_token: string;
    refresh_token: string;
    token_type: string;
    firebase_uid: string | null;
    roles: { role: string; description: string }[];
    permissions?: string[];
    tenant_id: string;
    last_login: string | null;
    provider: string;
}

// ---- Vendor Types ----

export interface CreateVendorBody {
    user_id?: string;
    user: {
        user_id: string;
        first_name: string;
        last_name: string;
        email?: string;
        phone_number: string;
    };
    business_name: string;
    display_name: string;
    contact_email: string;
    contact_phone: string;
    policy: string;
    website: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    tax_id: string;
    bank_account: {
        bank_name: string;
        account_number: string;
        account_name: string;
        swift_code: string;
        branch_code: string;
    };
    verification_documents: any[];
    commission_rate: string;
    store: {
        store_name: string;
        store_slug: string;
        description: string;
        branding: {
            logo_url: string;
            colors: {
                primary: string;
                secondary: string;
                accent: string;
                text: string;
                background: string;
            };
        };
        banners: any[];
    };
}

// ---- Delivery Partner Types ----

export interface CreateDeliveryPartnerBody {
    form_type: "individual" | "business" | "wakala";
    business_name?: string;
    business_logo?: string;
    contact_details?: string;
    profile_picture?: string;
    vehicle_type?: string;
    location?: string;
    location_description?: string;
    drivers?: Array<{
        name: string;
        phone: string;
        vehicle_type: string;
        location: string;
        location_description: string;
    }>;
}

// ---- Firebase Types ----

export interface FirebaseLoginBody {
    id_token: string;
}

export interface FirebaseTokenBody {
    token: string;
    device_type: "web" | "ios" | "android";
}

export interface FirebaseTokenResponse {
    message: string;
    device_id: string;
}

export interface FirebaseTokenStatusBody {
    token: string;
    device_type: "web" | "ios" | "android";
    status: "active" | "inactive" | "revoked";
    permission_granted: boolean;
}

export interface FirebaseTokenStatusResponse {
    message: string;
    updated: boolean;
}

// ---- Error Types ----

export interface ApiError {
    message: string;
    status: number;
    code?: string;
    details?: any;
}

// ---- Payment Types ----

export interface InitiatePaymentBody {
    payment_method: string;
    phone_number?: string;
    amount?: number;
}

export interface InitiatePaymentDirectlyBody {
    payment_method: string;
    phone_number: string;
    amount: number;
    description?: string;
}

export interface InitiatePaymentResponse {
    transaction_id: string;
    status: string;
    message: string;
}

export interface PaymentStatusResponse {
    transaction_id: string;
    status: string;
    amount: number;
    currency: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
}

export interface CreateInstallmentPlanBody {
    order_id: string;
    total_amount: number;
    installment_count: number;
    frequency: "weekly" | "biweekly" | "monthly";
}

export interface InstallmentPlanResponse {
    plan_id: number;
    order_id: string;
    total_amount: number;
    installment_count: number;
    frequency: string;
    status: string;
    installments: Array<{
        id: number;
        amount: number;
        due_date: string;
        status: string;
    }>;
}

export interface UpdateInstallmentPlanBody {
    status?: string;
    installment_count?: number;
    frequency?: string;
}

// ---- KYC / Verification Types ----

export interface KYCDocument {
    document_type_id: string; // Document type ID from configuration
    document_url: string;
    verification_status?: "pending" | "approved" | "rejected";
}

export interface KYCSubmissionRequest extends Array<KYCDocument> { }

export interface KYCSubmissionResponse {
    vendor_id: string;
    documents: KYCDocument[];
    submitted_at: string;
    status: string;
}
