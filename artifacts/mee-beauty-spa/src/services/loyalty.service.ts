// src/services/loyalty.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from './supabase';
import { settingsService } from './settings.service';
import type { LoyaltyConfig, LoyaltyAccount, LoyaltyTransaction, LoyaltyWallet, LoyaltyRedeemConfig } from '@/types/loyalty';
import { getCache, setCache } from './cache.service';

const LOYALTY_CONFIG_KEY = 'loyalty_config';
const LOYALTY_CONFIG_CACHE_KEY = 'loyalty_config_cache';
const CACHE_TTL = 30; // 30 giây

// ============================================================
// HELPER: Map mode từ config → database enum
// ============================================================

function mapLoyaltyModeToDb(mode: string): string {
  if (mode === 'SESSIONS') return 'SESSION';
  if (mode === 'POINTS') return 'POINT';
  return mode;
}

// ============================================================
// HELPER: Map mode từ database enum → UI mode
// ============================================================

function mapDbModeToUiMode(dbMode: string, fallbackMode: string): string {
  if (dbMode === 'SESSION') return 'SESSIONS';
  if (dbMode === 'POINT') return 'POINTS';
  return fallbackMode;
}

// ============================================================
// CONFIG
// ============================================================

export async function getConfig(): Promise<LoyaltyConfig> {
  const cached = getCache<LoyaltyConfig>(LOYALTY_CONFIG_CACHE_KEY, CACHE_TTL);
  if (cached) return cached;

  const defaultConfig: LoyaltyConfig = {
    enabled: false,
    mode: 'OFF',
    sessions_required: 5,
    sessions_reward: 1,
    amount_per_point: 100000,
    points_per_amount: 10,
    expiry_months: null,
  };

  try {
    const saved = await settingsService.getConfig(LOYALTY_CONFIG_KEY);
    const config = saved ? { ...defaultConfig, ...saved } : defaultConfig;
    setCache(LOYALTY_CONFIG_CACHE_KEY, config);
    return config;
  } catch (err) {
    console.error('Lỗi tải config Loyalty:', err);
    return defaultConfig;
  }
}

export async function saveConfig(config: LoyaltyConfig): Promise<void> {
  await settingsService.setConfig(LOYALTY_CONFIG_KEY, config);
  const { invalidateCache } = await import('./cache.service');
  invalidateCache(LOYALTY_CONFIG_CACHE_KEY);
}

// ============================================================
// ACCOUNT
// ============================================================

export async function getOrCreateAccount(customerId: string): Promise<LoyaltyAccount> {
  const { data: existing, error: findError } = await supabase
    .from('loyalty_accounts')
    .select('*')
    .eq('customer_id', customerId)
    .maybeSingle();

  if (findError && findError.code !== 'PGRST116') {
    throw findError;
  }

  if (existing) {
    // Đảm bảo hai balance mới có giá trị (nếu chưa có)
    if (existing.sessions_balance === undefined || existing.points_balance === undefined) {
      await supabase
        .from('loyalty_accounts')
        .update({
          sessions_balance: existing.mode === 'SESSION' ? existing.balance : 0,
          points_balance: existing.mode === 'POINT' ? existing.balance : 0,
        })
        .eq('id', existing.id);
      const { data: updated } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('id', existing.id)
        .single();
      return updated as LoyaltyAccount;
    }
    return existing as LoyaltyAccount;
  }

  const config = await getConfig();
  const dbMode = mapLoyaltyModeToDb(config.mode);
  const { data: newAccount, error: insertError } = await supabase
    .from('loyalty_accounts')
    .insert({
      customer_id: customerId,
      mode: dbMode,
      sessions_balance: 0,
      points_balance: 0,
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return newAccount as LoyaltyAccount;
}

export async function getAccount(customerId: string): Promise<LoyaltyAccount | null> {
  const { data, error } = await supabase
    .from('loyalty_accounts')
    .select('*')
    .eq('customer_id', customerId)
    .maybeSingle();

  if (error) throw error;
  return data as LoyaltyAccount | null;
}

// ============================================================
// WALLET
// ============================================================

export async function getWallet(customerId: string): Promise<LoyaltyWallet> {
  const config = await getConfig();
  const account = await getAccount(customerId);

  if (!account) {
    return {
      hasAccount: false,
      mode: config.mode,
      sessions_balance: 0,
      points_balance: 0,
      balance: 0,
      isEligible: false,
      expires_at: null,
      sessions_required: config.sessions_required || 0,
      sessions_progress: 0,
    };
  }

  const uiMode = mapDbModeToUiMode(account.mode, config.mode);
  let isEligible = false;
  let sessionsProgress = 0;

  if (uiMode === 'SESSIONS') {
    const required = config.sessions_required || 0;
    sessionsProgress = account.sessions_balance;
    isEligible = required > 0 && account.sessions_balance >= required;
  } else if (uiMode === 'POINTS') {
    // Lấy loyalty_points nhỏ nhất > 0
    const { data: minPointItem, error } = await supabase
      .from('catalog_items')
      .select('loyalty_points')
      .eq('status', 'ACTIVE')
      .gt('loyalty_points', 0)
      .order('loyalty_points', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!error && minPointItem) {
      const minPoints = minPointItem.loyalty_points;
      isEligible = account.points_balance >= minPoints;
    } else {
      isEligible = false;
    }
  }

  const balance = uiMode === 'SESSIONS' ? account.sessions_balance : account.points_balance;

  return {
    hasAccount: true,
    mode: uiMode,
    sessions_balance: account.sessions_balance,
    points_balance: account.points_balance,
    balance,
    isEligible,
    expires_at: account.expires_at,
    sessions_required: config.sessions_required || 0,
    sessions_progress: sessionsProgress,
  };
}

// ============================================================
// TRANSACTIONS
// ============================================================

export async function getTransactions(
  customerId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<LoyaltyTransaction[]> {
  const account = await getAccount(customerId);
  if (!account) return [];

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('loyalty_account_id', account.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

// ============================================================
// EARN
// ============================================================

export async function earnFromInvoice(invoiceId: string): Promise<void> {
  console.log('🔍 [Loyalty] earnFromInvoice called, invoiceId:', invoiceId);

  const config = await getConfig();
  console.log('📋 [Loyalty] Config:', config);

  if (!config.enabled || config.mode === 'OFF') {
    console.log('⏹️ [Loyalty] Loyalty disabled or mode OFF');
    return;
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, customer_id, status, is_gift')
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    console.error('❌ [Loyalty] Invoice not found:', invoiceId, invoiceError);
    return;
  }

  if (!['PAID', 'PARTIALLY_PAID'].includes(invoice.status)) {
    console.log('⏹️ [Loyalty] Invoice status not PAID/PARTIALLY_PAID:', invoice.status);
    return;
  }

  if (invoice.is_gift) {
    console.log('⏹️ [Loyalty] Invoice is gift, skip');
    return;
  }

  if (!invoice.customer_id) {
    console.log('⏹️ [Loyalty] No customer_id, skip');
    return;
  }

  const account = await getOrCreateAccount(invoice.customer_id);
  console.log('👤 [Loyalty] Account:', account);

  const { data: existing } = await supabase
    .from('loyalty_transactions')
    .select('id')
    .eq('loyalty_account_id', account.id)
    .eq('invoice_id', invoiceId)
    .eq('transaction_type', 'EARN')
    .maybeSingle();

  if (existing) {
    console.log('⏹️ [Loyalty] Invoice already earned:', invoiceId);
    return;
  }

  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('id, catalog_item_id, package_id, quantity, total_amount, is_gift')
    .eq('invoice_id', invoiceId);

  if (itemsError) {
    console.error('❌ [Loyalty] Error fetching invoice items:', itemsError);
    return;
  }

  const eligibleItems = items.filter((item) => !item.package_id && !item.is_gift);
  if (eligibleItems.length === 0) {
    console.log('⏹️ [Loyalty] No eligible items');
    return;
  }

  let earnAmount = 0;

  if (config.mode === 'SESSIONS') {
    const catalogIds = eligibleItems.map((item) => item.catalog_item_id).filter(Boolean);
    let serviceIds: string[] = [];
    if (catalogIds.length > 0) {
      const { data: services } = await supabase
        .from('services')
        .select('catalog_item_id')
        .in('catalog_item_id', catalogIds);
      if (services) {
        serviceIds = services.map((s) => s.catalog_item_id);
      }
    }
    const sessionCount = eligibleItems
      .filter((item) => serviceIds.includes(item.catalog_item_id))
      .reduce((sum, item) => sum + (item.quantity || 0), 0);

    if (sessionCount === 0) {
      console.log('⏹️ [Loyalty] No session to earn');
      return;
    }
    earnAmount = sessionCount;
  } else if (config.mode === 'POINTS') {
    const totalAmount = eligibleItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
    if (totalAmount === 0) {
      console.log('⏹️ [Loyalty] Total amount = 0');
      return;
    }
    const pointsPerAmount = config.points_per_amount || 0;
    const amountPerPoint = config.amount_per_point || 100000;
    if (amountPerPoint <= 0 || pointsPerAmount <= 0) {
      console.log('⏹️ [Loyalty] Invalid points config');
      return;
    }
    earnAmount = Math.floor((totalAmount / amountPerPoint) * pointsPerAmount);
    if (earnAmount === 0) {
      console.log('⏹️ [Loyalty] Earn amount = 0');
      return;
    }
  }

  // Cập nhật đúng cột
  let updateField: { sessions_balance?: number; points_balance?: number } = {};
  let newBalance = 0;
  if (config.mode === 'SESSIONS') {
    newBalance = (account.sessions_balance || 0) + earnAmount;
    updateField.sessions_balance = newBalance;
  } else if (config.mode === 'POINTS') {
    newBalance = (account.points_balance || 0) + earnAmount;
    updateField.points_balance = newBalance;
  }

  const { error: updateError } = await supabase
    .from('loyalty_accounts')
    .update({
      ...updateField,
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  if (updateError) {
    console.error('❌ [Loyalty] Error updating account:', updateError);
    return;
  }

  const { error: txError } = await supabase
    .from('loyalty_transactions')
    .insert({
      loyalty_account_id: account.id,
      invoice_id: invoiceId,
      transaction_type: 'EARN',
      amount: earnAmount,
      balance_after: newBalance,
      source_type: 'INVOICE',
      note: `Earn from invoice ${invoiceId}`,
      created_at: new Date().toISOString(),
      created_by: null,
      organization_id: account.organization_id,
      branch_id: account.branch_id,
    });

  if (txError) {
    console.error('❌ [Loyalty] Error inserting transaction:', txError);
    return;
  }

  console.log('✅ [Loyalty] Earned successfully!', {
    invoiceId,
    earnAmount,
    newBalance,
  });
}

// ============================================================
// REDEEM – Gọi RPC (đã sửa trong SQL)
// ============================================================

export interface RedeemResult {
  success: boolean;
  transaction_id?: string;
  entitlement_id?: string;
  balance_after?: number;
  points_used?: number;
  mode?: string;
  error?: string;
}

export async function redeem(
  customerId: string,
  catalogItemId: string,
  staffId: string,
  note?: string,
): Promise<RedeemResult> {
  const { data, error } = await supabase.rpc('redeem_loyalty', {
    p_customer_id: customerId,
    p_catalog_item_id: catalogItemId,
    p_staff_id: staffId,
    p_note: note || null,
  });

  if (error) {
    return {
      success: false,
      error: error.message || 'Redeem failed',
    };
  }

  return data;
}

// ============================================================
// ADJUSTMENT
// ============================================================

export async function adjust(
  customerId: string,
  amount: number,
  note: string,
  staffId: string,
): Promise<void> {
  if (!note || note.trim() === '') {
    throw new Error('Vui lòng nhập lý do điều chỉnh');
  }

  const account = await getOrCreateAccount(customerId);
  const config = await getConfig();
  const targetField = config.mode === 'SESSIONS' ? 'sessions_balance' : 'points_balance';
  const currentBalance = config.mode === 'SESSIONS' ? account.sessions_balance : account.points_balance;
  const newBalance = currentBalance + amount;

  if (newBalance < 0) {
    throw new Error('Số dư không thể âm');
  }

  await supabase
    .from('loyalty_accounts')
    .update({
      [targetField]: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  await supabase.from('loyalty_transactions').insert({
    loyalty_account_id: account.id,
    transaction_type: 'ADJUSTMENT',
    amount: amount,
    balance_after: newBalance,
    source_type: 'ADMIN',
    note: note.trim(),
    created_by: null,
    created_at: new Date().toISOString(),
    organization_id: account.organization_id,
    branch_id: account.branch_id,
  });
}

// ============================================================
// REFUND / REVERSAL
// ============================================================

export async function processRefund(invoiceId: string): Promise<void> {
  const { data: transactions, error: findError } = await supabase
    .from('loyalty_transactions')
    .select('id, loyalty_account_id, amount, balance_after')
    .eq('invoice_id', invoiceId)
    .eq('transaction_type', 'EARN')
    .order('created_at', { ascending: false });

  if (findError) {
    console.error('Error finding earn transaction:', findError);
    return;
  }

  if (!transactions || transactions.length === 0) return;

  const earnTx = transactions[0];

  const { data: reversals, error: revError } = await supabase
    .from('loyalty_transactions')
    .select('id')
    .eq('reversal_of', earnTx.id)
    .eq('transaction_type', 'REVERSAL')
    .limit(1);

  if (revError) {
    console.error('Error checking reversal:', revError);
    return;
  }

  if (reversals && reversals.length > 0) {
    console.log('Already reversed:', invoiceId);
    return;
  }

  const { data: account, error: accError } = await supabase
    .from('loyalty_accounts')
    .select('id, sessions_balance, points_balance, organization_id, branch_id')
    .eq('id', earnTx.loyalty_account_id)
    .single();

  if (accError || !account) {
    console.error('Account not found:', earnTx.loyalty_account_id);
    return;
  }

  const config = await getConfig();
  const targetField = config.mode === 'SESSIONS' ? 'sessions_balance' : 'points_balance';
  const currentBalance = config.mode === 'SESSIONS' ? account.sessions_balance : account.points_balance;
  const newBalance = currentBalance - (earnTx.amount || 0);

  await supabase
    .from('loyalty_accounts')
    .update({
      [targetField]: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  await supabase.from('loyalty_transactions').insert({
    loyalty_account_id: account.id,
    invoice_id: invoiceId,
    transaction_type: 'REVERSAL',
    amount: -(earnTx.amount || 0),
    balance_after: newBalance,
    source_type: 'INVOICE',
    reversal_of: earnTx.id,
    note: `Reversal of invoice ${invoiceId}`,
    created_at: new Date().toISOString(),
    created_by: null,
    organization_id: account.organization_id,
    branch_id: account.branch_id,
  });
}

// ============================================================
// REDEEM CONFIG
// ============================================================

export async function getRedeemableItems(mode: string): Promise<any[]> {
  if (mode === 'SESSIONS') {
    // SESSIONS: trả về tất cả service/product đang hoạt động
    const { data: items, error } = await supabase
      .from('catalog_items')
      .select(`
        id,
        name,
        code,
        item_type,
        price,
        status
      `)
      .eq('status', 'ACTIVE')
      .in('item_type', ['SERVICE', 'PRODUCT'])
      .order('name', { ascending: true });

    if (error) throw error;
    return items || [];
  } else if (mode === 'POINTS') {
    // POINTS: chỉ trả về item có loyalty_points > 0
    const { data: items, error } = await supabase
      .from('catalog_items')
      .select(`
        id,
        name,
        code,
        item_type,
        price,
        status,
        loyalty_points
      `)
      .eq('status', 'ACTIVE')
      .gt('loyalty_points', 0)
      .order('name', { ascending: true });

    if (error) throw error;
    return items || [];
  }

  return [];
}

export async function getRedeemConfig(catalogItemId: string): Promise<LoyaltyRedeemConfig | null> {
  return null; // không còn dùng
}

export async function updateRedeemConfig(
  catalogItemId: string,
  pointsRequired: number | null,
  isActive: boolean,
): Promise<void> {
  // Không làm gì
}

// ============================================================
// EXPIRY
// ============================================================

export async function processExpiry(): Promise<number> {
  const config = await getConfig();
  if (!config.enabled || config.mode === 'OFF' || !config.expiry_months) return 0;

  const { data: accounts, error } = await supabase
    .from('loyalty_accounts')
    .select('id, customer_id, sessions_balance, points_balance, organization_id, branch_id')
    .lt('expires_at', new Date().toISOString())
    .gt('sessions_balance', 0)
    .or('points_balance.gt.0');

  if (error) {
    console.error('Error finding expired accounts:', error);
    return 0;
  }

  let count = 0;
  for (const account of accounts || []) {
    const newSessions = 0;
    const newPoints = 0;
    await supabase
      .from('loyalty_accounts')
      .update({
        sessions_balance: newSessions,
        points_balance: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    await supabase.from('loyalty_transactions').insert({
      loyalty_account_id: account.id,
      transaction_type: 'EXPIRY',
      amount: -(account.sessions_balance + account.points_balance),
      balance_after: 0,
      source_type: 'EXPIRY',
      note: `Expired points/sessions`,
      created_at: new Date().toISOString(),
      created_by: null,
      organization_id: account.organization_id,
      branch_id: account.branch_id,
    });
    count++;
  }
  return count;
}

export async function checkExpiryOnLoad(): Promise<void> {
  try {
    const config = await getConfig();
    if (config.enabled && config.expiry_months) {
      await processExpiry();
      console.log('✅ Expiry check completed');
    }
  } catch (err) {
    console.error('⚠️ Expiry check error:', err);
  }
}