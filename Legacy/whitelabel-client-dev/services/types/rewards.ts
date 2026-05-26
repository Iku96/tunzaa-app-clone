// Rewards Service API Types

// Configuration Types
export interface RewardConfig {
  tenant_id: string;
  points_per_tzs: number; // Corrected field name
  redemption_points: number; // Corrected field name (was redemption_rate)
  redemption_value_tzs: number; // Added from API response
  referral_bonus_points: number;
  coupon_expiry_days: number | null; // API might return null?
  is_active: boolean;
  created_at: string;
  updated_at: string;
}



// Point Transaction Types
export type TransactionType = 'earn' | 'redeem' | 'referral_bonus' | 'adjustment';

export interface PointTransaction {
  id: string;
  tenant_id: string;
  user_id: string;
  transaction_type: TransactionType;
  points: number;
  order_id?: string;
  amount_tzs?: number;
  reference_id?: string | null;
  coupon_code?: string;
  referral_code?: string;
  description: string;
  metadata?: object;
  created_at: string;
  updated_at: string;
}

// User Balance Types
export interface UserBalance {
  user_id: string;
  balance: number;
  history: PointTransaction[];
  tenant_id?: string;
  lifetime_earned?: number;
  lifetime_redeemed?: number;
}

export interface GetBalanceParams {
  include_history?: boolean;
  limit?: number;
}



// Redeeming Points Types
export interface RedeemPointsBody {
  points: number;
  user_id: string; // Added to match API requirements
}

export interface RedeemPointsResponse {
  id: string;
  user_id: string;
  transaction_type: 'redeem';
  points: number;
  coupon_code: string;
  coupon_value: number;
  currency: string;
  expires_at: string;
  description: string;
  new_balance: number;
  created_at: string;
}

// Referral Code Types
export interface ReferralCode {
  id: string;
  created_at: string;
  updated_at: string;
  code: string;
  user_id: string;
  tenant_id: string;
  is_active: boolean;
}

export interface GenerateReferralCodeResponse {
  code_id: string;
  user_id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

// Referral Relationship Types
export interface ReferralRelationship {
  relationship_id: string;
  tenant_id: string;
  referrer_user_id: string;
  referee_id: string;
  referral_code: string;
  bonus_credited: boolean;
  first_order_date?: string;
  created_at: string;
}

export interface ApplyReferralCodeBody {
  referral_code: string;
  referee_id: string;
  tenant_id: string;
}

export interface ApplyReferralCodeResponse {
  relationship_id: string;
  referrer_user_id: string;
  referee_id: string;
  referral_code: string;
  bonus_credited: boolean;
  message: string;
  created_at: string;
}



// Event Types
export interface RewardEvent {
  event_type: 'rewards.points.earned' | 'rewards.points.redeemed' | 'rewards.referral.bonus_credited' | 'rewards.config.updated';
  tenant_id: string;
  user_id: string;
  data: object;
  timestamp: string;
}

// Error Types
export interface RewardError {
  detail: string | Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}