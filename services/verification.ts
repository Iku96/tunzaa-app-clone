import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

// Verification Types
export interface KYCDocument {
  document_type: string; // Document type ID from configuration/document-types
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

export const verificationApi = {
  // Submit Vendor KYC Documents
  submitVendorKYC: async (
    vendorId: string,
    documents: KYCSubmissionRequest
  ): Promise<KYCSubmissionResponse> => {
    const response = await apiClient.post<KYCSubmissionResponse>(
      `marketplace/vendors/${vendorId}/kyc`,
      documents
    );
    return response.data;
  },
};

// React Query Hooks

export const useSubmitVendorKYC = () => {
  return useMutation({
    mutationFn: ({
      vendorId,
      documents,
    }: {
      vendorId: string;
      documents: KYCSubmissionRequest;
    }) => verificationApi.submitVendorKYC(vendorId, documents),
  });
};
