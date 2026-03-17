export interface CreateAffiliateBody {
  name: string;
  email: string;
  phone: string;
  user_id: string;
  tenant_id: string;
  bio: string;
  website: string;
  social_media?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface AffiliateResponse {
  name: string;
  user_id: string;
  email: string;
  bio: string;
  website: string;
  phone: string;
  id: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  social_media?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface GetAffiliateResponse extends AffiliateResponse {}

// Update Affiliate Types
export interface UpdateAffiliateBody {
  name?: string;
  bio?: string;
  website?: string;
  phone?: string;
  social_media?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}



// Affiliate Request Types
export interface CreateVendorRequestBody {
  affiliate_id: string;
  vendor_id: string;
  message: string;
  request_type: "vendor";
  commission_rate?: number;
}

export interface CreateProductRequestBody {
  affiliate_id: string;
  vendor_id: string;
  product_id: string;
  message: string;
  request_type: "product";
  commission_rate?: number;
}

export interface AffiliateRequestResponse {
  id: string;
  affiliate_id: string;
  request_type: "vendor" | "product";
  vendor_id: string;
  product_id: string | null;
  status: string;
  message: string;
  response_message: string | null;
  commission_rate?: number;
  created_at: string;
  updated_at: string | null;
  responded_at: string | null;
}

// Request Actions Types
export interface ApproveRequestBody {
  response_message: string;
}

export interface RejectRequestBody {
  response_message: string;
}

// Referral Link Types
export interface ReferralLinkResponse {
  id: string;
  affiliate_id: string;
  request_id: string;
  code: string;
  vendor_id: string;
  product_id: string | null;
  is_active: boolean;
  expiry_date: string | null;
  clicks: number;
  orders: number;
  total_commission: number;
  created_at: string;
  updated_at: string | null;
}

export interface GetAffiliateLinksResponse {
  links: ReferralLinkResponse[];
  total: number;
}

// Order Tracking Types
export interface TrackOrderBody {
  order_id: string;
  amount: number;
  referral_code: string;
  cookie_id: string;
}

export interface OrderTrackingResponse {
  id: string;
  order_id: string;
  affiliate_id: string;
  referral_link_id: string;
  amount: number;
  commission_amount: number;
  is_paid: boolean;
  created_at: string;
}

// Statistics Types
export interface AffiliateStatsResponse {
  clicks: number;
  orders: number;
  total_earnings: number;
  conversion_rate: number;
}





export interface GetAffiliateRequestsParams {
  affiliate_id: string;
  status?: string;
  skip?: number;
  limit?: number;
}

export interface GetAffiliateRequestsResponse {
  requests: AffiliateRequestResponse[];
  total: number;
}

export interface GetVendorRequestsParams {
  vendor_id: string;
  status?: string;
  skip?: number;
  limit?: number;
}

export interface GetVendorRequestsResponse {
  requests: AffiliateRequestResponse[];
  total: number;
}
