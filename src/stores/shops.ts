import { useQuery } from "@tanstack/react-query";
import { Store, getStores, getStoreById } from "../services/shops";

export interface Shop {
  id: string;
  name: string;
  logo: string;
  delivery: string;
  badge?: string;
  rating: number;
  reviews: number;
  featured?: boolean;
}

const mockShops: Shop[] = [
  {
    id: "hisense",
    name: "Hisense",
    logo: "https://images.pexels.com/photos/1336924/pexels-photo-1336924.jpeg?auto=compress&cs=tinysrgb&w=100",
    delivery: "By 5:50am",
    rating: 4.8,
    reviews: 2456,
    featured: true,
  },
  {
    id: "sony",
    name: "Sony",
    logo: "https://images.pexels.com/photos/1337753/pexels-photo-1337753.jpeg?auto=compress&cs=tinysrgb&w=100",
    delivery: "By 6:30am",
    rating: 4.7,
    reviews: 1856,
    featured: true,
  },
  {
    id: "heineken",
    name: "Heineken",
    logo: "https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=100",
    delivery: "By 6:30am",
    badge: "$25 off",
    rating: 4.9,
    reviews: 3456,
    featured: true,
  },
  {
    id: "toyota",
    name: "Toyota",
    logo: "https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg?auto=compress&cs=tinysrgb&w=100",
    delivery: "By 10:00am",
    rating: 4.6,
    reviews: 1234,
    featured: true,
  },
  {
    id: "sport-collective",
    name: "Sport Collective",
    logo: "https://images.pexels.com/photos/1337191/pexels-photo-1337191.jpeg?auto=compress&cs=tinysrgb&w=100",
    delivery: "By 8:30am",
    rating: 4.5,
    reviews: 987,
    featured: true,
  },
  {
    id: "makita",
    name: "Makita",
    logo: "https://images.pexels.com/photos/1337161/pexels-photo-1337161.jpeg?auto=compress&cs=tinysrgb&w=100",
    delivery: "By 7:45am",
    rating: 4.8,
    reviews: 2345,
    featured: true,
  },
];

// Query keys for React Query
const shopsKeys = {
  all: ["shops"] as const,
  lists: () => [...shopsKeys.all, "list"] as const,
  list: (filters: { is_featured?: boolean; is_active?: boolean }) =>
    [...shopsKeys.lists(), filters] as const,
  details: () => [...shopsKeys.all, "detail"] as const,
  detail: (id: string) => [...shopsKeys.details(), id] as const,
};

/**
 * Hook to fetch all shops with optional filtering
 */
export const useShops = (params?: { is_featured?: boolean; is_active?: boolean, vendor_verification_status?: string, is_vendor_active?: boolean, verification_status?: string}) => {
  return useQuery({
    queryKey: shopsKeys.list(params || {}),
    queryFn: () => getStores(params),
  });
};

/**
 * Hook to fetch only featured shops
 */
export const useFeaturedShops = (params?: { is_featured?: boolean; is_active?: boolean, vendor_verification_status?: string, is_vendor_active?: boolean, verification_status?: string}) => {
  return useShops({ vendor_verification_status: "approved", is_vendor_active: true, verification_status: "approved" });
};

/**
 * Hook to fetch a single shop by ID
 */
export const useShopById = (id: string) => {
  return useQuery({
    queryKey: shopsKeys.detail(id),
    queryFn: () => getStoreById(id),
    enabled: !!id, // Only run the query if we have an ID
  });
};
