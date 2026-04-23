import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { ReactNode } from "react";
import { apiClient } from "./client";

// Vendor Types
export interface VendorUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface VendorBankAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
  swift_code: string;
  branch_code: string;
}

export interface UpdateVendorBody {
  business_name?: string;
  display_name?: string;
  policy?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  bank_account?: VendorBankAccount;
  verification_documents?: any[];
  verification_status?: string;
  is_active?: boolean;
  commission_rate?: string;
  rating?: number;
  store?: any | null;
}

export interface VendorResponse {
  name: ReactNode;
  vendor_id: string;
  tenant_id: string;
  user_id: string;
  user: VendorUser;
  business_name: string;
  display_name: string;
  policy: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  latitude?: number; // Optional: vendor location coordinates
  longitude?: number; // Optional: vendor location coordinates
  tax_id: string;
  bank_account: VendorBankAccount;
  verification_documents: any[];
  verification_status: string;
  is_active: boolean;
  commission_rate: string;
  rating: number;
  stores: Array<{
    store_id: string;
    tenant_id: string;
    vendor_id: string;
    store_name: string;
    store_slug: string;
    description: string;
    branding: any;
    banners: any[];
    categories: any[];
    featured_categories: any[];
    general_policy: string;
    return_policy: string;
    shipping_policy: string;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string[];
    is_active: boolean;
    is_featured: boolean;
    extra_metadata: any;
    created_at: string;
    updated_at: string;
  }>;
  store?: any | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}

export interface VendorsResponse {
  items: VendorResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface VendorsParams {
  skip?: number;
  limit?: number;
  is_active?: boolean;
  verification_status?: string;
}

export const vendorsApi = {
  // Get Vendor by ID
  getVendor: async (vendorId: string): Promise<VendorResponse> => {
    const response = await apiClient.get<VendorResponse>(
      `marketplace/vendors/${vendorId}`
    );
    return response.data;
  },

  // Get All Vendors
  getVendors: async (params?: VendorsParams): Promise<VendorsResponse> => {
    const response = await apiClient.get<VendorsResponse>(
      "marketplace/vendors/",
      { params }
    );
    return response.data;
  },

  // Update Vendor Profile
  updateVendor: async (
    vendorId: string,
    data: UpdateVendorBody
  ): Promise<VendorResponse> => {
    const response = await apiClient.put<VendorResponse>(
      `marketplace/vendors/${vendorId}`,
      data
    );
    return response.data;
  },
};

// React Query Hooks

export const useGetVendor = (vendorId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => vendorsApi.getVendor(vendorId),
    enabled: enabled && !!vendorId,
  });
};

export const useUpdateVendor = () => {
  return useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: UpdateVendorBody;
    }) => vendorsApi.updateVendor(vendorId, data),
  });
};
