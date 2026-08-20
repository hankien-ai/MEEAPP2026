import { supabase } from "./supabase";
import { Expense } from "../types/domain";

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    expense: Omit<Expense, "id" | "created_at" | "updated_at">,
  ): Promise<Expense> {
    const { data, error } = await supabase
      .from("expenses")
      .insert(expense)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) throw error;
  },
};
