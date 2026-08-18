export interface Customer {
  id: string;
  organization_id: string;
  branch_id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  birthday?: string | null;
  gender?: "male" | "female" | "other" | string | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;

  // Optional UI Fields (chưa lưu trong DB schema)
  visitCount?: number;
  totalSpend?: number;
  loyaltyPoints?: number;
  tags?: string[];
}

export interface CreateCustomerInput {
  full_name: string;
  phone: string;
  email?: string | null;
  birthday?: string | null;
  gender?: string | null;
}

export interface UpdateCustomerInput {
  full_name?: string;
  phone?: string;
  email?: string | null;
  birthday?: string | null;
  gender?: string | null;
}
