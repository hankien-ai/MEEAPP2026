import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async () => {
  const now = new Date();
  const future30m = new Date(now.getTime() + 30 * 60 * 1000);
  const future15m = new Date(now.getTime() + 15 * 60 * 1000);

  // Lấy các lịch hẹn sẽ diễn ra trong 15-30 phút tới
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, customer:customer_id(full_name), staff:staff_id(full_name)')
    .eq('status', 'SCHEDULED')
    .gte('appointment_date', now.toISOString().split('T')[0])
    .lte('start_time', future30m.toTimeString().slice(0,5))
    .gt('start_time', now.toTimeString().slice(0,5));

  // Tạo thông báo cho từng appointment
  for (const app of appointments || []) {
    // Kiểm tra xem đã gửi reminder chưa (tránh duplicate)
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('reference_id', app.id)
      .eq('type', 'APPOINTMENT_REMINDER')
      .eq('staff_id', app.staff_id)
      .maybeSingle();

    if (existing) continue;

    await supabase.from('notifications').insert({
      staff_id: app.staff_id,
      type: 'APPOINTMENT_REMINDER',
      title: '⏰ Nhắc lịch hẹn',
      message: `Bạn có lịch hẹn với ${app.customer?.full_name} lúc ${app.start_time}`,
      reference_type: 'appointment',
      reference_id: app.id,
    });

    // Gửi push
    await supabase.functions.invoke('send-notification', {
      body: {
        staffId: app.staff_id,
        title: '⏰ Nhắc lịch hẹn',
        body: `Bạn có lịch hẹn với ${app.customer?.full_name} lúc ${app.start_time}`,
        data: { appointmentId: app.id }
      }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});