// supabase/functions/clean-expired-appointments/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async () => {
  try {
    const now = new Date();
    // Lấy các lịch hẹn có appointment_date < hôm nay
    // hoặc ngày hôm nay nhưng giờ đã qua 5 phút
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const timeStr = fiveMinutesAgo.toTimeString().slice(0, 5);

    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .or(`appointment_date < now()::date, and(appointment_date = now()::date, start_time <= '${timeStr}')`);

    if (error) throw error;

    if (data && data.length > 0) {
      const ids = data.map((row: any) => row.id);
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      console.log(`🗑️ Đã xóa ${ids.length} lịch hẹn quá hạn`);
    }

    return new Response(JSON.stringify({ success: true, deleted: data?.length || 0 }), {
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