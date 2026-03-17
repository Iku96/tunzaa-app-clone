// Buyer Profile & Delivery Address API Types

export interface DeliveryAddress {
  address_id?: string;
  title: string;
  land_mark: string;
  address_line1: string;
  city: string;
  state_province: string;
  country: string;
  lat?: string;
  lng?: string;
}

export interface BuyerProfile {
  user_id: string;
  tenant_id: string;
  contact_email: string;
  contact_phone: string;
  default_delivery_address?: string;
  delivery_address: DeliveryAddress[];
  created_at: string;
  updated_at: string;
}

export interface UpdateBuyerProfileBody {
  user_id: string;
  tenant_id: string;
  contact_email: string;
  contact_phone: string;
  created_at?: string;
  delivery_address: DeliveryAddress[];
  default_delivery_address?: string;
}

export interface UpdateBuyerProfileResponse extends BuyerProfile {
  _id: string;
}
