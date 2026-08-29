// supabase/functions/staff-pin-login/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { create, verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-me';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Rate limit: lưu số lần thử sai theo IP
const rateLimit = new Map<string, { count: number; blockedUntil: number }>();

serve(async (req) => {
  // Chỉ nhận POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { pin } = await req.json();
  if (!pin || typeof pin !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing PIN' }), { status: 400 });
  }

  // Validate PIN: 6 chữ số
  if (!/^\d{6}$/.test(pin)) {
    return new Response(JSON.stringify({ error: 'PIN must be 6 digits' }), { status: 400 });
  }

  // Rate limit: lấy IP
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (record && record.blockedUntil > now) {
    return new Response(JSON.stringify({ error: 'Too many attempts, try again later' }), { status: 429 });
  }

  // Khởi tạo Supabase client với service role key (chỉ server-side)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Lấy tất cả staff ACTIVE có pin_hash
  const { data: staffs, error } = await supabase
    .from('staff')
    .select('id, full_name, phone, role, status, pin_hash, organization_id, branch_id')
    .eq('status', 'ACTIVE')
    .not('pin_hash', 'is', null);

  if (error) {
    console.error('Error fetching staff:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }

  let matchedStaff = null;
  for (const staff of staffs) {
    const valid = await bcrypt.compare(pin, staff.pin_hash);
    if (valid) {
      matchedStaff = staff;
      break;
    }
  }

  if (!matchedStaff) {
    // Tăng số lần thử sai
    if (record) {
      record.count += 1;
      if (record.count >= 5) {
        record.blockedUntil = now + 60 * 1000; // block 1 phút
      }
    } else {
      rateLimit.set(ip, { count: 1, blockedUntil: 0 });
    }
    return new Response(JSON.stringify({ error: 'Invalid PIN' }), { status: 401 });
  }

  // Reset rate limit nếu thành công
  rateLimit.delete(ip);

  // Tạo JWT token, hết hạn sau 12 giờ
  const payload = {
    staff_id: matchedStaff.id,
    role: matchedStaff.role,
    organization_id: matchedStaff.organization_id,
    branch_id: matchedStaff.branch_id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 // 12 giờ
  };
  const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, JWT_SECRET);

  // Trả về thông tin staff (không bao gồm pin_hash)
  return new Response(JSON.stringify({
    staff: {
      id: matchedStaff.id,
      full_name: matchedStaff.full_name,
      phone: matchedStaff.phone,
      role: matchedStaff.role,
      status: matchedStaff.status,
      organization_id: matchedStaff.organization_id,
      branch_id: matchedStaff.branch_id,
    },
    token,
    expires_at: payload.exp,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});