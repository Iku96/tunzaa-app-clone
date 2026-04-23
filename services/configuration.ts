import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  VehicleTypesResponse,
  GetVehicleTypesParams,
} from "./types/configuration";

// Document Types Interfaces
export interface DocumentType {
  document_id: string;
  tenant_id: string;
  name: string;
  description: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentTypesResponse {
  items: DocumentType[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetDocumentTypesParams {
  tenant_id: string;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

// Entities Interfaces (for KYC)
export interface EntityDocumentType {
  document_type_id: string;
  tenant_id: string;
  name: string;
  description: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_required: boolean;
}

export interface Entity {
  entity_id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  document_types: EntityDocumentType[];
}

export interface EntitiesResponse {
  items: Entity[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetEntitiesParams {
  tenant_id: string;
  skip?: number;
  limit?: number;
}

export const configurationApi = {
  // Get Vehicle Types
  getVehicleTypes: async (
    params: GetVehicleTypesParams
  ): Promise<VehicleTypesResponse> => {
    const searchParams = new URLSearchParams({
      tenant_id: params.tenant_id,
    });

    if (params.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }

    const response = await apiClient.get<VehicleTypesResponse>(
      `configuration/vehicle-types?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get Document Types
  getDocumentTypes: async (
    params: GetDocumentTypesParams
  ): Promise<DocumentTypesResponse> => {
    const searchParams = new URLSearchParams({
      tenant_id: params.tenant_id,
    });

    if (params.is_active !== undefined) {
      searchParams.append("is_active", params.is_active.toString());
    }
    if (params.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }

    const response = await apiClient.get<DocumentTypesResponse>(
      `configuration/document-types?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get Entities (for KYC)
  getEntities: async (params: GetEntitiesParams): Promise<EntitiesResponse> => {
    try {

      const searchParams = new URLSearchParams({
        tenant_id: params.tenant_id,
      });

      if (params.skip !== undefined) {
        searchParams.append("skip", params.skip.toString());
      }
      if (params.limit !== undefined) {
        searchParams.append("limit", params.limit.toString());
      }

      const url = `configuration/entities?${searchParams.toString()}`;

      const response = await apiClient.get<EntitiesResponse>(url);


      // Validate response structure
      if (!response.data) {
        throw new Error("Empty response from entities API");
      }

      if (!response.data.items || !Array.isArray(response.data.items)) {
        console.warn("Invalid entities response structure:", response.data);
        return {
          items: [],
          total: 0,
          skip: params.skip || 0,
          limit: params.limit || 10,
        };
      }

      return response.data;
    } catch (error) {
      console.error("configurationApi.getEntities error:", error);
      throw error;
    }
  },
};

// React Query Hooks

export const useGetVehicleTypes = (
  params: GetVehicleTypesParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["vehicleTypes", params],
    queryFn: () => configurationApi.getVehicleTypes(params),
    enabled,
  });
};

export const useGetDocumentTypes = (
  params: GetDocumentTypesParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["documentTypes", params],
    queryFn: () => configurationApi.getDocumentTypes(params),
    enabled,
  });
};

export const useEntities = (params: GetEntitiesParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["entities", params],
    queryFn: () => configurationApi.getEntities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
};
