// supabase/functions/staff-pin-hash/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// 👇 HÀM TRẢ VỀ HEADER CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

serve(async (req) => {
  // 👇 XỬ LÝ PREFLIGHT (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }

  const { staff_id, pin } = await req.json();
  if (!staff_id || !pin || typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid staff_id or PIN' }),
      { 
        status: 400, 
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Hash PIN
  const saltRounds = 10;
  const hash = await bcrypt.hash(pin, saltRounds);

  // Update staff
  const { data, error } = await supabase
    .from('staff')
    .update({ pin_hash: hash, pin_created_at: new Date().toISOString() })
    .eq('id', staff_id)
    .select('id, full_name, role, status')
    .single();

  if (error) {
    console.error('Error updating PIN:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to set PIN' }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({ success: true, staff: data }),
    { 
      status: 200, 
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    }
  );
});