// Configuration API Types

export interface VehicleType {
  _id: string;
  vehicle_id: string;
  tenant_id: string;
  name: string;
  description: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VehicleTypesResponse {
  items: VehicleType[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetVehicleTypesParams {
  tenant_id: string;
  skip?: number;
  limit?: number;
}
