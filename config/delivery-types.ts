import type { DeliveryType } from "@/src/services/types/delivery";

// Fallback delivery types to use when API fails or is unavailable
export const FALLBACK_DELIVERY_TYPES: DeliveryType[] = [
  {
    id: "standard",
    tenant_id: "default",
    name: "Standard Delivery",
    description: "Next Day Delivery",
    is_active: true,
    price: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  // {
  //   id: "express",
  //   tenant_id: "default",
  //   name: "Express Delivery",
  //   description: "Fast delivery service within 30-60 minutes",
  //   is_active: true,
  //   price: 1500,
  //   time: "Later today",
  //   created_at: new Date().toISOString(),
  //   updated_at: new Date().toISOString(),
  // },
  // {
  //   id: "same_day",
  //   tenant_id: "default",
  //   name: "Same Day Delivery",
  //   description: "Delivery on the same day before 6 PM",
  //   is_active: true,
  //   price: 3000,
  //   time: "Tomorrow",
  //   created_at: new Date().toISOString(),
  //   updated_at: new Date().toISOString(),
  // },
];

// Helper function to get delivery type by ID from a list of delivery types
export const getDeliveryTypeById = (
  deliveryTypes: DeliveryType[], 
  id: string
): DeliveryType | undefined => {
  return deliveryTypes.find(type => type.id === id);
};

// Helper function to get delivery type by ID from fallback
export const getFallbackDeliveryTypeById = (id: string): DeliveryType | undefined => {
  return FALLBACK_DELIVERY_TYPES.find(type => type.id === id);
};

// Helper function to get all active delivery types
export const getActiveDeliveryTypes = (deliveryTypes: DeliveryType[]): DeliveryType[] => {
  return deliveryTypes.filter(type => type.is_active);
}; 