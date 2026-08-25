// src/services/payment-settings.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from './supabase';

export interface PaymentSettings {
  id: string;
  organization_id: string;
  branch_id: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  pin_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentSettingsInput {
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

// Danh sách ngân hàng Việt Nam
export const vietnamBanks = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'CTG', name: 'VietinBank' },
  { code: 'VIB', name: 'VIB' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'HDB', name: 'HDBank' },
  { code: 'MSB', name: 'MSB' },
  { code: 'SHB', name: 'SHB' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'OCB', name: 'OCB' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'MBB', name: 'MBBank' },
  { code: 'EIB', name: 'Eximbank' },
  { code: 'SEAB', name: 'SeABank' },
  { code: 'ABB', name: 'ABBank' },
  { code: 'BACABANK', name: 'Bac A Bank' },
  { code: 'BVB', name: 'BaoViet Bank' },
  { code: 'CBB', name: 'CB Bank' },
  { code: 'DAB', name: 'DongA Bank' },
  { code: 'GPB', name: 'GPBank' },
  { code: 'IVB', name: 'Indovina Bank' },
  { code: 'KLB', name: 'KienLong Bank' },
  { code: 'LDB', name: 'LienVietPostBank' },
  { code: 'NAB', name: 'Nam A Bank' },
  { code: 'NCB', name: 'NCB' },
  { code: 'PGB', name: 'PGBank' },
  { code: 'PVB', name: 'PVcomBank' },
  { code: 'SGB', name: 'SGB' },
  { code: 'VAB', name: 'Viet A Bank' },
  { code: 'VRB', name: 'VRB' },
  { code: 'CIMB', name: 'CIMB Bank' },
  { code: 'UOB', name: 'UOB' },
  { code: 'HSBC', name: 'HSBC' },
  { code: 'SCB', name: 'Standard Chartered' },
];

// Hàm hash PIN bằng SHA-256 (Web Crypto API)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const paymentSettingsService = {
  async getSettings(orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<PaymentSettings | null> {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('organization_id', orgId)
      .eq('branch_id', branchId)
      .maybeSingle();
    if (error) {
      console.error('Lỗi lấy payment settings:', error);
      return null;
    }
    return data || null;
  },

  async saveSettings(settings: PaymentSettingsInput, orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<PaymentSettings | null> {
    const existing = await this.getSettings(orgId, branchId);
    const payload = {
      organization_id: orgId,
      branch_id: branchId,
      bank_code: settings.bank_code,
      bank_name: settings.bank_name,
      account_number: settings.account_number,
      account_name: settings.account_name,
      updated_at: new Date().toISOString(),
    };
    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('payment_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('payment_settings')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }
    return result;
  },

  // Tạo hoặc cập nhật PIN (dùng SHA-256)
  async setPin(pin: string, orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<boolean> {
    const hash = await hashPin(pin);
    const existing = await this.getSettings(orgId, branchId);
    if (existing) {
      const { error } = await supabase
        .from('payment_settings')
        .update({ pin_hash: hash, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const payload = {
        organization_id: orgId,
        branch_id: branchId,
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        pin_hash: hash,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('payment_settings').insert(payload);
      if (error) throw error;
    }
    return true;
  },

  // Xác minh PIN
  async verifyPin(pin: string, orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<boolean> {
    const settings = await this.getSettings(orgId, branchId);
    if (!settings || !settings.pin_hash) return false;
    const hashedInput = await hashPin(pin);
    return hashedInput === settings.pin_hash;
  },

  async hasPin(orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<boolean> {
    const settings = await this.getSettings(orgId, branchId);
    return !!settings?.pin_hash;
  },

  async getBankConfig(orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<{ bankName: string; accountNumber: string; accountName: string; bankCode: string } | null> {
    const settings = await this.getSettings(orgId, branchId);
    if (settings && settings.bank_code && settings.account_number) {
      return {
        bankName: settings.bank_name,
        accountNumber: settings.account_number,
        accountName: settings.account_name,
        bankCode: settings.bank_code,
      };
    }
    return null;
  }
};