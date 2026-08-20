import { supabase } from "./supabase";
import {
  demoCatalogItems,
  demoCustomers,
  demoStaff,
  demoExpenses,
} from "../data/demo";

export const seedService = {
  async seedAll(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Seed catalog items
      const { error: catalogErr } = await supabase.from("catalog_items").upsert(
        demoCatalogItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          item_type: item.item_type,
          price: item.price,
          duration_minutes: item.duration_minutes,
          commission_rate: item.commission_rate,
          status: item.status,
        })),
        { onConflict: "id" },
      );
      if (catalogErr) throw catalogErr;

      // 2. Seed customers
      const { error: customerErr } = await supabase.from("customers").upsert(
        demoCustomers.map((c) => ({
          id: c.id,
          full_name: c.full_name,
          phone: c.phone,
          email: c.email,
          birth_date: c.birth_date,
          address: c.address,
          notes: c.notes,
          total_spend: c.total_spend,
          last_visit: c.last_visit,
        })),
        { onConflict: "id" },
      );
      if (customerErr) throw customerErr;

      // 3. Seed staff
      const { error: staffErr } = await supabase.from("staff").upsert(
        demoStaff.map((s) => ({
          id: s.id,
          full_name: s.full_name,
          phone: s.phone,
          email: s.email,
          role: s.role,
          status: s.status,
          base_salary: s.base_salary,
          commission_rate: s.commission_rate,
          started_on: s.started_on,
        })),
        { onConflict: "id" },
      );
      if (staffErr) throw staffErr;

      // 4. Seed expenses
      const { error: expenseErr } = await supabase.from("expenses").upsert(
        demoExpenses.map((e) => ({
          id: e.id,
          category: e.category,
          amount: e.amount,
          description: e.description,
          expense_date: e.expense_date,
          created_by: e.created_by,
        })),
        { onConflict: "id" },
      );
      if (expenseErr) throw expenseErr;

      return { success: true, message: "Data seeded successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Error seeding data" };
    }
  },
};
