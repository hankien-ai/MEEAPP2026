import { supabase } from "./supabase";
import { OperationsMetrics } from "../types/domain";

export const operationsService = {
  async getMetrics(): Promise<OperationsMetrics | null> {
    try {
      const { data: expenses, error: expError } = await supabase
        .from("expenses")
        .select("amount");

      if (expError) throw expError;

      const totalExpenses = expenses
        ? expenses.reduce((acc, cur) => acc + (cur.amount || 0), 0)
        : 0;

      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: sessionsCount } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { data: sales } = await supabase
        .from("sales")
        .select("total_amount");

      const totalRevenue = sales
        ? sales.reduce((acc, cur) => acc + (cur.total_amount || 0), 0)
        : 0;

      return {
        total_revenue: totalRevenue,
        active_bookings: bookingsCount || 0,
        completed_sessions: sessionsCount || 0,
        expenses_total: totalExpenses,
      };
    } catch {
      return null;
    }
  },
};
