// Delivery Management API Types

export interface DeliveryType {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  is_active: boolean;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryTypesResponse {
  items: DeliveryType[];
  total: number;
  skip: number;
  limit: number;
}

export interface DeliveryPartnerLocation {
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusKm: number;
}

export interface DeliveryPartnerVehicle {
  type: string;
  details: string;
}

export interface DeliveryPartnerDocument {
  type: string;
  number: string;
  link: string;
  verified: boolean;
}

export interface DeliveryPartnerKYC {
  verified: boolean;
  documents: DeliveryPartnerDocument[];
}

export interface DeliveryPartner {
  partner_id: string;
  user_id: string;
  type: "individual" | "business" | "pickup_point";
  name: string;
  profile_picture: string;
  location: DeliveryPartnerLocation;
  vehicle_info: DeliveryPartnerVehicle;
  commission_percent: number;
  drivers: any[];
  kyc: DeliveryPartnerKYC;
  is_active: boolean;
  is_available: boolean;
  tenant_id: string;
  id: string;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
}

export interface GetDeliveryPartnersResponse {
  items: DeliveryPartner[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetDeliveryPartnersParams {
  partner_type?: "individual" | "business" | "pickup_point";
  is_active?: boolean;
  kyc_verified?: boolean;
  skip?: number;
  limit?: number;
}

// New Delivery Management Types

export interface Location {
  lat: number;
  lng: number;
}

export interface PickupPoint {
  partner_id: string;
  timestamp: string;
}

export type DeliveryStage =
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "rejected";

export interface DeliveryStageData {
  partner_id: string;
  stage: DeliveryStage;
  timestamp: string;
  location?: Location | null;
  proof?: DeliveryProof | null;
}

export interface DeliveryProof {
  proof?: string; // URL to the proof image
  message?: string;
  photo_url?: string; // Keep for backward compatibility
  signature?: string;
}

export interface Delivery {
  id: string;
  tenant_id: string;
  order_id: string;
  pickup_points?: PickupPoint[];
  stages: DeliveryStageData[];
  current_stage: DeliveryStage;
  estimated_delivery_time: string | null;
  actual_delivery_time?: string | null;
  created_at: string;
  updated_at: string;
  partner_name?: string;
  order_number?: string;
}

export interface GetDeliveriesResponse {
  items: Delivery[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetDeliveriesParams {
  partner_id?: string;
  stage?: DeliveryStage;
  include_order_numbers?: boolean;
  include_partner_names?: boolean;
  skip?: number;
  limit?: number;
}

export interface UpdateDeliveryStageBody {
  partner_id: string;
  stage: DeliveryStage;
  location?: Location; // Optional - not required for rejected stage
  proof?: DeliveryProof;
  reason?: string; // Required when stage is "rejected"
}

export interface AddProofBody {
  partner_id: string;
  proof: DeliveryProof;
}

export interface UpdateDeliveryPartnerStatusBody {
  is_available: boolean;
}
