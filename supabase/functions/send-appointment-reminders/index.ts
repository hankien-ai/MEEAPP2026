// supabase/functions/send-appointment-reminders/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import webpush from 'https://esm.sh/web-push@3.6.6';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
webpush.setVapidDetails(
  'mailto:admin@meebeauty.com',
  vapidPublicKey,
  vapidPrivateKey
);

serve(async () => {
  try {
    const now = new Date();
    const remindTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 phút sau
    const targetTimeStr = remindTime.toTimeString().slice(0, 5);
    const todayStr = now.toISOString().split('T')[0];

    // Lấy các lịch hẹn sắp tới trong 5 phút tới, chưa được nhắc
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        customer_id,
        staff_id,
        appointment_date,
        start_time,
        note,
        customers:customer_id (full_name, phone),
        staff:staff_id (full_name)
      `)
      .eq('status', 'SCHEDULED')
      .is('reminded_at', null)
      .eq('appointment_date', todayStr)
      .gte('start_time', now.toTimeString().slice(0, 5))
      .lt('start_time', targetTimeStr);

    if (error) throw error;

    if (data && data.length > 0) {
      for (const appointment of data) {
        const staffId = appointment.staff_id;
        if (!staffId) continue;

        const customerName = appointment.customers?.full_name || 'Khách';

        // 1. Tạo in-app notification
        await supabase.from('notifications').insert({
          staff_id: staffId,
          type: 'APPOINTMENT_REMINDER',
          title: '🔔 Nhắc lịch hẹn sắp tới',
          message: `Bạn có lịch với khách ${customerName} lúc ${appointment.start_time}`,
          reference_type: 'appointment',
          reference_id: appointment.id,
          created_at: new Date().toISOString(),
        });

        // 2. Gửi push notification qua web-push
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth')
          .eq('staff_id', staffId);

        if (subscriptions && subscriptions.length > 0) {
          const payload = JSON.stringify({
            title: '🔔 Nhắc lịch hẹn',
            body: `Bạn có lịch với khách ${customerName} lúc ${appointment.start_time}`,
            data: { type: 'appointment', id: appointment.id },
          });

          for (const sub of subscriptions) {
            try {
              await webpush.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                payload
              );
            } catch (err) {
              // Nếu lỗi (endpoint hết hạn), xóa subscription
              if (err.statusCode === 410 || err.statusCode === 404) {
                await supabase
                  .from('push_subscriptions')
                  .delete()
                  .eq('endpoint', sub.endpoint);
              }
            }
          }
        }

        // 3. Đánh dấu đã nhắc
        await supabase
          .from('appointments')
          .update({ reminded_at: new Date().toISOString() })
          .eq('id', appointment.id);
      }
    }

    return new Response(JSON.stringify({ success: true, reminded: data?.length || 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Lỗi:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});