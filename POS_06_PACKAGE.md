# PACKAGE SERVICE
===== artifacts/mee-beauty-spa/src/services/package.service.ts =====
import { supabase } from "./supabase";
import { CustomerPackage } from "../types/domain";

export const packageService = {
  async getByCustomerId(customerId: string): Promise<CustomerPackage[]> {
    const { data, error } = await supabase
      .from("customer_packages")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPackage(
    pkg: Omit<CustomerPackage, "id" | "created_at" | "updated_at">,
  ): Promise<CustomerPackage> {
    const { data, error } = await supabase
      .from("customer_packages")
      .insert(pkg)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async useSession(packageId: string): Promise<CustomerPackage> {
    const { data: pkg, error: fetchError } = await supabase
      .from("customer_packages")
      .select("remaining_sessions, status")
      .eq("id", packageId)
      .single();

    if (fetchError) throw fetchError;
    if (!pkg) throw new Error("Package not found");
    if (pkg.remaining_sessions <= 0) throw new Error("No remaining sessions");

    const nextSessions = pkg.remaining_sessions - 1;
    const nextStatus = nextSessions === 0 ? "DEPLETED" : pkg.status;

    const { data, error } = await supabase
      .from("customer_packages")
      .update({
        remaining_sessions: nextSessions,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", packageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
