/**
 * Delivery Service API
 * Connects to the delivery-service backend for partner management and delivery operations.
 * Replaces all hardcoded mock data in DeliveryContext.tsx.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

// ---- Types ----

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Location {
    coordinates: Coordinates;
    radiusKm: number;
}

export interface VehicleInfo {
    vehicle_type_id: string;
    details: string;
    metadata?: Record<string, any>;
}

export interface KYCDocument {
    document_type_id: string;
    document_id?: string;
    number?: string;
    link: string;
    verified: boolean;
}

export interface KYC {
    verified: boolean;
    documents: KYCDocument[];
}

export interface PartnerDriver {
    partner_id?: string;
    driver_id: string;
    name: string;
    phone: string;
    email?: string;
    vehicle_info?: VehicleInfo;
    is_active: boolean;
}

export interface Partner {
    partner_id: string;
    tenant_id: string;
    user_id: string;
    type: "individual" | "business" | "pickup_point";
    name: string;
    profile_picture?: string;
    contact_email?: string;
    contact_phone?: string;
    location?: Location;
    location_description?: string;
    vehicle_info?: VehicleInfo;
    drivers: PartnerDriver[];
    kyc: KYC;
    commission_percent: number;
    is_active: boolean;
    is_available: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
}

export interface PartnerCreateBody {
    user_id: string;
    type: "individual" | "business" | "pickup_point";
    name: string;
    profile_picture?: string;
    contact_email?: string;
    contact_phone?: string;
    location?: Location;
    location_description?: string;
    vehicle_info?: VehicleInfo;
    drivers?: PartnerDriver[];
    kyc?: KYC;
}

export interface PartnerUpdateBody {
    name?: string;
    profile_picture?: string;
    contact_email?: string;
    contact_phone?: string;
    location?: Location;
    location_description?: string;
    vehicle_info?: VehicleInfo;
    commission_percent?: number;
    is_active?: boolean;
    is_available?: boolean;
    kyc?: KYC;
}

export interface DeliveryStage {
    stage: string;
    timestamp: string;
    location?: { lat: number; lng: number };
    notes?: string;
    proof?: Record<string, any>;
}

export interface DeliveryProof {
    type: string;
    url?: string;
    signature_url?: string;
    notes?: string;
    recipient_name?: string;
}

export interface Delivery {
    delivery_id: string;
    tenant_id: string;
    order_id: string;
    partner_id: string;
    status: string;
    pickup_location?: { lat: number; lng: number; address?: string };
    dropoff_location?: { lat: number; lng: number; address?: string };
    estimated_delivery_time?: string;
    actual_delivery_time?: string;
    stages: DeliveryStage[];
    proof?: DeliveryProof;
    created_at: string;
    updated_at: string;
    // Enriched fields (when include flags are set)
    partner_details?: Partner;
    order_number?: string;
}

export interface DeliveriesResponse {
    items: Delivery[];
    total: number;
    skip: number;
    limit: number;
}

export interface ListDeliveriesParams {
    partner_id?: string;
    status?: string;
    skip?: number;
    limit?: number;
    include_partner_details?: boolean;
    include_order_numbers?: boolean;
}

export interface ListPartnersParams {
    skip?: number;
    limit?: number;
    partner_type?: string;
    is_active?: boolean;
    is_available?: boolean;
    kyc_verified?: boolean;
}

export interface PartnersResponse {
    items: Partner[];
    total: number;
    skip: number;
    limit: number;
}

// ---- API Functions ----

export const deliveryApi = {
    // Partner endpoints

    /** Get a delivery partner by their user ID */
    getPartnerByUser: async (userId: string): Promise<Partner> => {
        const response = await apiClient.get<Partner>(`/partners/user/${userId}`);
        return response.data;
    },

    /** Get a delivery partner by partner ID */
    getPartner: async (partnerId: string): Promise<Partner> => {
        const response = await apiClient.get<Partner>(`/partners/${partnerId}`);
        return response.data;
    },

    /** List delivery partners with filters */
    listPartners: async (params?: ListPartnersParams): Promise<PartnersResponse> => {
        const response = await apiClient.get<PartnersResponse>("/partners/", { params });
        return response.data;
    },

    /** Update a delivery partner */
    updatePartner: async (partnerId: string, data: PartnerUpdateBody): Promise<Partner> => {
        const response = await apiClient.put<Partner>(`/partners/${partnerId}`, data);
        return response.data;
    },

    /** Update partner status (availability, active) */
    updatePartnerStatus: async (
        partnerId: string,
        data: { is_active?: boolean; is_available?: boolean; is_approved?: boolean }
    ): Promise<Partner> => {
        const response = await apiClient.patch<Partner>(`/partners/${partnerId}/status`, data);
        return response.data;
    },

    /** Submit KYC documents for a partner */
    submitKYC: async (partnerId: string, documents: KYCDocument[]): Promise<Partner> => {
        const response = await apiClient.post<Partner>(`/partners/${partnerId}/kyc`, documents);
        return response.data;
    },

    // Delivery endpoints

    /** List deliveries with filters and pagination */
    listDeliveries: async (params?: ListDeliveriesParams): Promise<DeliveriesResponse> => {
        const response = await apiClient.get<DeliveriesResponse>("/deliveries/", { params });
        return response.data;
    },

    /** Get a single delivery by ID */
    getDelivery: async (
        deliveryId: string,
        options?: { include_partner_details?: boolean; include_order_details?: boolean }
    ): Promise<Delivery> => {
        const response = await apiClient.get<Delivery>(`/deliveries/${deliveryId}`, {
            params: options,
        });
        return response.data;
    },

    /** Get delivery by order ID */
    getDeliveryByOrder: async (orderId: string): Promise<Delivery> => {
        const response = await apiClient.get<Delivery>(`/deliveries/order/${orderId}`);
        return response.data;
    },

    /** Add a stage update to a delivery (e.g. accepted, picked_up, in_transit) */
    addDeliveryStage: async (
        deliveryId: string,
        data: {
            partner_id: string;
            stage: string;
            location?: { lat: number; lng: number };
            notes?: string;
        }
    ): Promise<Delivery> => {
        const response = await apiClient.post<Delivery>(`/deliveries/${deliveryId}/stage`, data);
        return response.data;
    },

    /** Add proof of delivery and mark as delivered */
    addDeliveryProof: async (
        deliveryId: string,
        data: {
            partner_id: string;
            proof: DeliveryProof;
            location?: { lat: number; lng: number };
        }
    ): Promise<Delivery> => {
        const response = await apiClient.post<Delivery>(`/deliveries/${deliveryId}/proof`, data);
        return response.data;
    },

    /** Update estimated delivery time */
    updateEstimatedTime: async (
        deliveryId: string,
        estimatedTime: string
    ): Promise<Delivery> => {
        const response = await apiClient.patch<Delivery>(
            `/deliveries/${deliveryId}/estimated-time`,
            { estimated_time: estimatedTime }
        );
        return response.data;
    },
};

// ---- React Query Hooks ----

/** Fetch the current user's partner profile */
export const usePartnerByUser = (userId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["partner", "user", userId],
        queryFn: () => deliveryApi.getPartnerByUser(userId),
        enabled: enabled && !!userId,
    });
};

/** Fetch a partner by ID */
export const usePartner = (partnerId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["partner", partnerId],
        queryFn: () => deliveryApi.getPartner(partnerId),
        enabled: enabled && !!partnerId,
    });
};

/** Fetch deliveries for a partner */
export const useDeliveries = (params?: ListDeliveriesParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["deliveries", params],
        queryFn: () => deliveryApi.listDeliveries(params),
        enabled,
    });
};

/** Fetch a single delivery */
export const useDelivery = (deliveryId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["delivery", deliveryId],
        queryFn: () => deliveryApi.getDelivery(deliveryId, {
            include_partner_details: true,
            include_order_details: true,
        }),
        enabled: enabled && !!deliveryId,
    });
};

/** Fetch a delivery by order ID */
export const useDeliveryByOrder = (orderId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["delivery", "order", orderId],
        queryFn: () => deliveryApi.getDeliveryByOrder(orderId),
        enabled: enabled && !!orderId,
    });
};

/** Mutation: update delivery stage */
export const useAddDeliveryStage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deliveryId, data }: {
            deliveryId: string;
            data: { partner_id: string; stage: string; location?: { lat: number; lng: number }; notes?: string };
        }) => deliveryApi.addDeliveryStage(deliveryId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deliveries"] });
        },
    });
};

/** Mutation: add delivery proof */
export const useAddDeliveryProof = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deliveryId, data }: {
            deliveryId: string;
            data: { partner_id: string; proof: DeliveryProof; location?: { lat: number; lng: number } };
        }) => deliveryApi.addDeliveryProof(deliveryId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deliveries"] });
        },
    });
};

/** Mutation: update partner profile */
export const useUpdatePartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ partnerId, data }: { partnerId: string; data: PartnerUpdateBody }) =>
            deliveryApi.updatePartner(partnerId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partner"] });
        },
    });
};

/** Mutation: submit KYC documents */
export const useSubmitKYC = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ partnerId, documents }: { partnerId: string; documents: KYCDocument[] }) =>
            deliveryApi.submitKYC(partnerId, documents),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partner"] });
        },
    });
};

/** Fetch delivery partners */
export const useGetDeliveryPartners = (params?: ListPartnersParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["partners", params],
        queryFn: () => deliveryApi.listPartners(params),
        enabled,
    });
};

/** Mock delivery types for fallback */
const MOCK_DELIVERY_TYPES = [
    {
        id: "standard",
        tenant_id: "default",
        name: "Standard Delivery",
        description: "Delivery within 2-3 business days",
        is_active: true,
        price: 5000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "express",
        tenant_id: "default",
        name: "Express Delivery",
        description: "Same day delivery",
        is_active: true,
        price: 15000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

/** Fetch delivery types with fallback */
export const useDeliveryTypesWithFallback = (enabled: boolean = true) => {
    // Return mock data for now since we don't have a delivery types endpoint
    return {
        data: MOCK_DELIVERY_TYPES,
        isLoading: false,
        error: null,
        isUsingFallback: true,
    };
};
