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
    [key: string]: boolean | undefined;
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

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Export recommendation types
export * from "./recommendations";

// Re-export all types from individual modules
export * from "./configuration";
export * from "./buyers";
export * from "./delivery";
export * from "./orders";
export * from "./payments";
export * from "./affiliates";
export * from "./notifications";
export * from "./ratings";
export * from "./rewards";
