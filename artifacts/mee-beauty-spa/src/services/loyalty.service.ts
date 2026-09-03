// src/services/loyalty.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from './supabase';
import { settingsService } from './settings.service';
import type { LoyaltyConfig, LoyaltyAccount, LoyaltyTransaction, LoyaltyWallet, LoyaltyRedeemConfig } from '@/types/loyalty';

const LOYALTY_CONFIG_KEY = 'loyalty_config';

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
    if (saved) {
      return { ...defaultConfig, ...saved };
    }
    return defaultConfig;
  } catch (err) {
    console.error('Lỗi tải config Loyalty:', err);
    return defaultConfig;
  }
}

export async function saveConfig(config: LoyaltyConfig): Promise<void> {
  await settingsService.setConfig(LOYALTY_CONFIG_KEY, config);
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
    return existing;
  }

  const config = await getConfig();
  const dbMode = mapLoyaltyModeToDb(config.mode);
  const { data: newAccount, error: insertError } = await supabase
    .from('loyalty_accounts')
    .insert({
      customer_id: customerId,
      mode: dbMode,
      balance: 0,
      organization_id: DEFAULT_ORG_ID,
      branch_id: DEFAULT_BRANCH_ID,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return newAccount;
}

export async function getAccount(customerId: string): Promise<LoyaltyAccount | null> {
  const { data, error } = await supabase
    .from('loyalty_accounts')
    .select('*')
    .eq('customer_id', customerId)
    .maybeSingle();

  if (error) throw error;
  return data;
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
      balance: 0,
      isEligible: false,
      expires_at: null,
      sessions_required: config.sessions_required || 0,
      sessions_progress: 0,
    };
  }

  // Map database mode sang UI mode
  const uiMode = mapDbModeToUiMode(account.mode, config.mode);

  let isEligible = false;
  let sessionsProgress = 0;

  if (uiMode === 'SESSIONS') {
    const required = config.sessions_required || 0;
    sessionsProgress = account.balance;
    isEligible = required > 0 && account.balance >= required;
  } else if (uiMode === 'POINTS') {
    const { data: redeemable } = await supabase
      .from('loyalty_redeem_config')
      .select('points_required')
      .eq('is_active', true)
      .limit(1);

    if (redeemable && redeemable.length > 0) {
      const minPoints = Math.min(...redeemable.map((r) => r.points_required));
      isEligible = account.balance >= minPoints;
    }
  }

  return {
    hasAccount: true,
    mode: uiMode,
    balance: account.balance || 0,
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
// EARN – CÓ LOG DEBUG CHI TIẾT
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
  console.log('📄 [Loyalty] Invoice:', invoice);

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
    .select('id, catalog_item_id, package_id, total_amount, is_gift')
    .eq('invoice_id', invoiceId);

  if (itemsError) {
    console.error('❌ [Loyalty] Error fetching invoice items:', itemsError);
    return;
  }
  console.log('📦 [Loyalty] Invoice items:', items);

  const eligibleItems = items.filter((item) => !item.package_id && !item.is_gift);
  console.log('✅ [Loyalty] Eligible items:', eligibleItems);

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
    console.log('🔍 [Loyalty] Service catalog IDs:', serviceIds);

    const sessionCount = eligibleItems
      .filter((item) => serviceIds.includes(item.catalog_item_id))
      .reduce((sum, item) => sum + (item.quantity || 0), 0);

    console.log('📊 [Loyalty] Session count (sum quantity):', sessionCount);

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
    console.log('💳 [Loyalty] Points earned:', earnAmount);
  }

  const newBalance = (account.balance || 0) + earnAmount;
  console.log('💰 [Loyalty] New balance:', newBalance);

  const { error: updateError } = await supabase
    .from('loyalty_accounts')
    .update({
      balance: newBalance,
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
// REDEEM – Gọi RPC
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
  const newBalance = (account.balance || 0) + amount;

  if (newBalance < 0) {
    throw new Error('Số dư không thể âm');
  }

  await supabase
    .from('loyalty_accounts')
    .update({
      balance: newBalance,
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
    created_by: staffId,
    created_at: new Date().toISOString(),
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

  if (!transactions || transactions.length === 0) {
    return;
  }

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
    .select('id, balance')
    .eq('id', earnTx.loyalty_account_id)
    .single();

  if (accError || !account) {
    console.error('Account not found:', earnTx.loyalty_account_id);
    return;
  }

  const newBalance = (account.balance || 0) - (earnTx.amount || 0);

  await supabase
    .from('loyalty_accounts')
    .update({
      balance: newBalance,
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
  });
}

// ============================================================
// REDEEM CONFIG
// ============================================================

export async function getRedeemableItems(mode: string): Promise<any[]> {
  const { data: items, error } = await supabase
    .from('catalog_items')
    .select(`
      id,
      name,
      code,
      item_type,
      price,
      status,
      loyalty_redeem_config!left (
        id,
        points_required,
        is_active
      )
    `)
    .in('item_type', ['SERVICE', 'PRODUCT'])
    .order('name', { ascending: true });

  if (error) throw error;

  if (mode === 'POINTS') {
    return (items || []).filter((item) => item.loyalty_redeem_config && item.loyalty_redeem_config.length > 0);
  }

  return items || [];
}

export async function getRedeemConfig(catalogItemId: string): Promise<LoyaltyRedeemConfig | null> {
  const { data, error } = await supabase
    .from('loyalty_redeem_config')
    .select('*')
    .eq('catalog_item_id', catalogItemId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateRedeemConfig(
  catalogItemId: string,
  pointsRequired: number | null,
  isActive: boolean,
): Promise<void> {
  if (pointsRequired !== null && pointsRequired < 0) {
    throw new Error('Số điểm phải lớn hơn hoặc bằng 0');
  }

  const existing = await getRedeemConfig(catalogItemId);

  if (existing) {
    if (pointsRequired === null) {
      await supabase
        .from('loyalty_redeem_config')
        .delete()
        .eq('catalog_item_id', catalogItemId);
    } else {
      await supabase
        .from('loyalty_redeem_config')
        .update({
          points_required: pointsRequired,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('catalog_item_id', catalogItemId);
    }
  } else if (pointsRequired !== null) {
    await supabase.from('loyalty_redeem_config').insert({
      catalog_item_id: catalogItemId,
      points_required: pointsRequired,
      is_active: isActive,
    });
  }
}

// ============================================================
// EXPIRY CHECK
// ============================================================

export async function processExpiry(): Promise<number> {
  const config = await getConfig();

  if (!config.enabled || config.mode === 'OFF') {
    return 0;
  }

  if (!config.expiry_months) {
    return 0;
  }

  const { data: accounts, error } = await supabase
    .from('loyalty_accounts')
    .select('id, customer_id, balance')
    .lt('expires_at', new Date().toISOString())
    .gt('balance', 0);

  if (error) {
    console.error('Error finding expired accounts:', error);
    return 0;
  }

  let count = 0;

  for (const account of accounts || []) {
    await supabase
      .from('loyalty_accounts')
      .update({
        balance: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    await supabase.from('loyalty_transactions').insert({
      loyalty_account_id: account.id,
      transaction_type: 'EXPIRY',
      amount: -(account.balance || 0),
      balance_after: 0,
      source_type: 'EXPIRY',
      note: `Expired points/sessions`,
      created_at: new Date().toISOString(),
    });

    count++;
  }

  return count;
}

// ============================================================
// CHECK EXPIRY ON LOAD
// ============================================================

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