// src/types/loyalty.ts
export interface LoyaltyConfig {
  enabled: boolean;
  mode: 'OFF' | 'SESSIONS' | 'POINTS';
  sessions_required: number;
  sessions_reward: number;
  amount_per_point: number;
  points_per_amount: number;
  expiry_months: number | null;
}

export interface LoyaltyAccount {
  id: string;
  organization_id: string;
  branch_id: string;
  customer_id: string;
  mode: 'SESSION' | 'POINT';
  sessions_balance: number;   // số buổi
  points_balance: number;     // số điểm
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  loyalty_account_id: string;
  invoice_id: string | null;
  transaction_type: 'EARN' | 'REDEEM' | 'ADJUSTMENT' | 'REVERSAL' | 'EXPIRY';
  amount: number;
  balance_after: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
  source_type: string | null;
  reversal_of: string | null;
  organization_id: string;
  branch_id: string;
}

export interface LoyaltyWallet {
  hasAccount: boolean;
  mode: string;
  sessions_balance: number;
  points_balance: number;
  balance?: number; // giữ cho tương thích cũ (sẽ là sessions_balance hoặc points_balance tùy mode)
  isEligible: boolean;
  expires_at: string | null;
  sessions_required: number;
  sessions_progress: number;
}

export interface LoyaltyRedeemConfig {
  id: string;
  catalog_item_id: string;
  points_required: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}