// supabase/functions/process-loyalty-expiry/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Lấy config loyalty
  const { data: configData } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'loyalty_config')
    .single();

  if (!configData) {
    return new Response(JSON.stringify({ error: 'No loyalty config' }), { status: 400 });
  }

  const config = configData.value;
  if (!config.enabled || !config.expiry_months) {
    return new Response(JSON.stringify({ message: 'Loyalty disabled or no expiry' }));
  }

  // Tìm các tài khoản hết hạn
  const now = new Date().toISOString();
  const { data: accounts, error } = await supabase
    .from('loyalty_accounts')
    .select('id, balance')
    .lt('expires_at', now)
    .gt('balance', 0);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let processed = 0;
  for (const acc of accounts || []) {
    // Reset balance về 0
    await supabase
      .from('loyalty_accounts')
      .update({ balance: 0, updated_at: now })
      .eq('id', acc.id);

    // Insert EXPIRY transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        loyalty_account_id: acc.id,
        transaction_type: 'EXPIRY',
        amount: -acc.balance,
        balance_after: 0,
        source_type: 'EXPIRY',
        note: `Expired ${acc.balance} points/sessions`,
        created_at: now,
      });

    processed++;
  }

  return new Response(JSON.stringify({ processed }), { status: 200 });
});