import { create } from "zustand";
import { TenantResponse } from "@/src/services/types";

interface TenantState {
  tenant: TenantResponse | null;
  isLoading: boolean;
  setTenant: (tenant: TenantResponse) => void;
  setLoading: (loading: boolean) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  isLoading: true,
  setTenant: (tenant) => {
    set({ tenant });
  },
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
