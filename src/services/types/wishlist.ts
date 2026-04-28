export interface WishlistItem {
  wishlist_id: string;
  tenant_id: string;
  user_id: string;
  product_id: string;
  variant_sku?: string;
  priority: number;
  notes?: string;
  notification_enabled: boolean;
  added_at: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Product {
  product_id: string;
  name: string;
  base_price: number;
  sale_price?: number;
  images: string[];
  is_active: boolean;
  inventory_quantity: number;
  is_wishlisted: boolean;
  sku?: string;
  description?: string;
  category_id?: string;
  vendor_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AddToWishlistBody {
  product_id: string;
  variant_sku?: string;
  priority?: number;
  notes?: string;
  notification_enabled?: boolean;
}

export interface UpdateWishlistItemBody {
  priority?: number;
  notes?: string;
  notification_enabled?: boolean;
}

export interface MoveToCartBody {
  product_ids: string[];
  verify_stock?: boolean;
}

export interface MoveToCartResponse {
  cart_id: string;
  moved_items: Array<{
    product_id: string;
    variant_sku?: string;
  }>;
  failed_items: Array<{
    product_id: string;
    variant_sku?: string;
    reason: string;
  }>;
  total_moved: number;
  total_failed: number;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface WishlistStatusResponse {
  is_wishlisted: boolean;
  wishlist_id?: string;
}

export interface WishlistCountResponse {
  count: number;
}

export interface ClearWishlistResponse {
  items_removed: number;
  message: string;
} 