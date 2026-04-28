import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { UserRole } from "./types";

// KYC Document Interfaces
export interface VendorKycDocument {
  document_type_id: string;
  document_url: string;
  verification_status: "pending" | "verified" | "rejected";
}

export interface DeliveryKycDocument {
  document_type_id: string;
  number: string;
  link: string;
  verified: boolean;
}

export interface KycSubmissionResponse {
  success: boolean;
  message: string;
  documents?: any[];
}

export const kycApi = {
  // Submit KYC for Vendor
  submitVendorKyc: async (
    vendorId: string,
    documents: VendorKycDocument[]
  ): Promise<KycSubmissionResponse> => {
    const response = await apiClient.post<KycSubmissionResponse>(
      `/marketplace/vendors/${vendorId}/kyc`,
      { documents } // Wrap in object
    );
    return response.data;
  },

  // Submit KYC for Delivery Partner
  submitDeliveryKyc: async (
    deliveryPartnerId: string,
    documents: DeliveryKycDocument[]
  ): Promise<KycSubmissionResponse> => {
    console.log("Delivery Partner in question: ", deliveryPartnerId);
    console.log("KYC Submission for delivery", JSON.stringify(documents))
    const response = await apiClient.post<KycSubmissionResponse>(
      `/partners/${deliveryPartnerId}/kyc/documents`,
      documents
    );
    return response.data;
  },

  // TODO: Add other user types (winga, etc.) as needed
  // submitWingaKyc: async (wingaId: string, documents: any[]) => { ... }
};

// React Query Hooks
export const useSubmitVendorKyc = () => {
  return useMutation({
    mutationFn: ({
      vendorId,
      documents,
    }: {
      vendorId: string;
      documents: VendorKycDocument[];
    }) => kycApi.submitVendorKyc(vendorId, documents),
  });
};

export const useSubmitDeliveryKyc = () => {
  return useMutation({
    mutationFn: ({
      deliveryPartnerId,
      documents,
    }: {
      deliveryPartnerId: string;
      documents: DeliveryKycDocument[];
    }) => kycApi.submitDeliveryKyc(deliveryPartnerId, documents),
  });
};
