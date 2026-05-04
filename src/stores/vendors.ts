import { useQuery } from "@tanstack/react-query";
import {
  vendorsApi,
  VendorResponse,
  VendorsResponse,
  VendorsParams,
} from "@/src/services/vendors";

// Query keys for better cache management
const vendorsKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorsKeys.all, "list"] as const,
  list: (filters: VendorsParams) =>
    [...vendorsKeys.lists(), filters] as const,
  details: () => [...vendorsKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorsKeys.details(), id] as const,
};

// React Query hooks
export const useVendors = (params?: VendorsParams) => {
  return useQuery({
    queryKey: vendorsKeys.list(params || {}),
    queryFn: () => vendorsApi.getVendors(params),
  });
};

export const useVendorById = (id: string) => {
  return useQuery({
    queryKey: vendorsKeys.detail(id),
    queryFn: () => vendorsApi.getVendor(id),
    enabled: !!id,
  });
}; 