import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Platform } from "react-native";

// Bulk Upload Types
export interface ValidationError {
  row_number?: number;
  field?: string;
  error_type: string;
  message: string;
  product_name?: string;
  sku?: string;
}

export interface ValidationWarning {
  row_number: number;
  field: string;
  message: string;
  product_name?: string;
}

export interface BatchSummary {
  success_rate?: number;
  category_resolution_stats?: {
    categories_processed: number;
    missing_category_warnings: number;
  };
}

export interface UploadBatch {
  batch_id: string;
  tenant_id: string;
  vendor_id: string;
  store_id: string;
  filename: string;
  upload_type: string;
  file_size_bytes: number;
  total_products: number;
  valid_products: number;
  invalid_products: number;
  warning_products: number;
  total_images: number;
  processed_images: number;
  failed_images: number;
  status: "pending" | "approved" | "rejected" | "processing";
  uploaded_by: string;
  uploaded_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  processing_started_at?: string | null;
  processing_completed_at?: string | null;
  processing_time_seconds?: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: BatchSummary;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface BatchesListResponse {
  items: UploadBatch[];
  total: number;
  skip: number;
  limit: number;
}

export interface ValidationSummary {
  total_products: number;
  valid_products: number;
  invalid_products: number;
  warning_products: number;
  status_breakdown: {
    valid: number;
    warning: number;
    invalid?: number;
  };
}

export interface BatchProduct {
  upload_id: string;
  batch_id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  sku: string;
  barcode?: string;
  category_ids: string[];
  tags: string[];
  base_price: number;
  sale_price?: number;
  cost_price?: number;
  inventory_quantity: number;
  inventory_tracking: boolean;
  low_stock_threshold: number;
  images: any[];
  weight?: number;
  dimensions?: any;
  requires_shipping: boolean;
  is_active: boolean;
  is_featured: boolean;
  row_number: number;
  validation_status: "valid" | "warning" | "invalid";
  validation_errors: string[];
  validation_warnings: string[];
  migrated: boolean;
  migrated_product_id?: string;
  migrated_at?: string;
  created_at: string;
}

export interface BatchProductsResponse {
  items: BatchProduct[];
  total: number;
  skip: number;
  limit: number;
}

export interface UploadFileRequest {
  file: any;
  vendor_id: string;
  store_id: string;
}

export interface ApproveRejectRequest {
  approved_by?: string;
  rejected_by?: string;
  notes?: string;
  reason?: string;
}

export const bulkUploadApi = {
  // Get CSV template
  getTemplate: async (): Promise<string> => {
    const response = await apiClient.get<string>("bulk-upload/template/csv", {
      responseType: "text",
    });
    return response.data;
  },

  // Upload file (CSV or ZIP)
  uploadFile: async (data: UploadFileRequest): Promise<UploadBatch> => {
    const formData = new FormData();

    console.log("Processing file upload for platform:", Platform.OS);

    // Handle file based on platform
    if (Platform.OS === "web") {
      // For web, fetch the blob from URI and create a File object
      try {
        const response = await fetch(data.file.uri);
        const blob = await response.blob();
        const mimeType = data.file.mimeType || blob.type || "text/csv";
        const file = new File([blob], data.file.name, { type: mimeType });

        console.log("Created File object for web:", {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        formData.append("file", file);
      } catch (error) {
        console.error("Failed to create file from URI:", error);
        throw new Error("Failed to create file from URI: " + error);
      }
    } else {
      // For React Native, use the uri/name/type format
      const mimeType = data.file.mimeType || "text/csv";
      const fileObject = {
        uri: data.file.uri,
        name: data.file.name,
        type: mimeType,
      } as any;

      console.log("Created file object for React Native:", {
        uri: fileObject.uri,
        name: fileObject.name,
        type: fileObject.type,
      });

      formData.append("file", fileObject);
    }

    formData.append("vendor_id", data.vendor_id);
    formData.append("store_id", data.store_id);

    const response = await apiClient.post<UploadBatch>(
      "bulk-upload/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get batches
  getBatches: async (
    vendor_id: string,
    status?: string,
    skip?: number,
    limit?: number
  ): Promise<BatchesListResponse> => {
    const params: any = { vendor_id };
    if (status) params.status = status;
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const response = await apiClient.get<BatchesListResponse>(
      "bulk-upload/batches",
      { params }
    );
    return response.data;
  },

  // Get single batch
  getBatch: async (batchId: string): Promise<UploadBatch> => {
    const response = await apiClient.get<UploadBatch>(
      `bulk-upload/batches/${batchId}`
    );
    return response.data;
  },

  // Get batch validation summary
  getBatchSummary: async (batchId: string): Promise<ValidationSummary> => {
    const response = await apiClient.get<ValidationSummary>(
      `bulk-upload/batches/${batchId}/validation-summary`
    );
    return response.data;
  },

  // Get batch products
  getBatchProducts: async (
    batchId: string,
    skip?: number,
    limit?: number
  ): Promise<BatchProductsResponse> => {
    const params: any = {};
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const response = await apiClient.get<BatchProductsResponse>(
      `bulk-upload/batches/${batchId}/products`,
      { params }
    );
    return response.data;
  },

  // Approve batch
  approveBatch: async (
    batchId: string,
    data: ApproveRejectRequest
  ): Promise<UploadBatch> => {
    const response = await apiClient.post<UploadBatch>(
      `bulk-upload/batches/${batchId}/approve`,
      data
    );
    return response.data;
  },

  // Reject batch
  rejectBatch: async (
    batchId: string,
    data: ApproveRejectRequest
  ): Promise<UploadBatch> => {
    const response = await apiClient.post<UploadBatch>(
      `bulk-upload/batches/${batchId}/reject`,
      data
    );
    return response.data;
  },
};

// React Query Hooks

export const useGetTemplate = () => {
  return useQuery({
    queryKey: ["bulk-upload-template"],
    queryFn: bulkUploadApi.getTemplate,
    staleTime: Infinity, // Template doesn't change often
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: bulkUploadApi.uploadFile,
  });
};

export const useGetBatches = (
  vendor_id: string,
  status?: string,
  skip?: number,
  limit?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["bulk-upload-batches", vendor_id, status, skip, limit],
    queryFn: () => bulkUploadApi.getBatches(vendor_id, status, skip, limit),
    enabled: enabled && !!vendor_id,
  });
};

export const useGetBatch = (batchId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["bulk-upload-batch", batchId],
    queryFn: () => bulkUploadApi.getBatch(batchId),
    enabled: enabled && !!batchId,
  });
};

export const useGetBatchSummary = (
  batchId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["bulk-upload-batch-summary", batchId],
    queryFn: () => bulkUploadApi.getBatchSummary(batchId),
    enabled: enabled && !!batchId,
  });
};

export const useGetBatchProducts = (
  batchId: string,
  skip?: number,
  limit?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["bulk-upload-batch-products", batchId, skip, limit],
    queryFn: () => bulkUploadApi.getBatchProducts(batchId, skip, limit),
    enabled: enabled && !!batchId,
  });
};

export const useApproveBatch = () => {
  return useMutation({
    mutationFn: ({
      batchId,
      data,
    }: {
      batchId: string;
      data: ApproveRejectRequest;
    }) => bulkUploadApi.approveBatch(batchId, data),
  });
};

export const useRejectBatch = () => {
  return useMutation({
    mutationFn: ({
      batchId,
      data,
    }: {
      batchId: string;
      data: ApproveRejectRequest;
    }) => bulkUploadApi.rejectBatch(batchId, data),
  });
};

