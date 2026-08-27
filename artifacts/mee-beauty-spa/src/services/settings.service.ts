// src/services/settings.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from './supabase';

export const DEFAULT_STAFF_PERMISSIONS = ['dashboard', 'pos', 'customers', 'operations'];

export const settingsService = {
  async getConfig(key: string, orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('organization_id', orgId)
        .eq('branch_id', branchId)
        .eq('key', key)
        .maybeSingle();

      if (error) {
        console.error('getConfig error:', error);
        return null;
      }
      return data?.value ?? null;
    } catch (err) {
      console.error('getConfig exception:', err);
      return null;
    }
  },

  async setConfig(key: string, value: any, orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID) {
    try {
      const payload = {
        organization_id: orgId,
        branch_id: branchId,
        key,
        value,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('app_settings')
        .upsert(payload, { onConflict: 'organization_id, branch_id, key' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('setConfig error:', err);
      throw err;
    }
  },

  async getStaffPermissions(orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<string[]> {
    try {
      const data = await this.getConfig('staff_permissions', orgId, branchId);
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      }
      return DEFAULT_STAFF_PERMISSIONS;
    } catch (err) {
      console.error('getStaffPermissions error:', err);
      return DEFAULT_STAFF_PERMISSIONS;
    }
  },

  async setStaffPermissions(permissions: string[], orgId: string = DEFAULT_ORG_ID, branchId: string = DEFAULT_BRANCH_ID): Promise<void> {
    await this.setConfig('staff_permissions', permissions, orgId, branchId);
  },
};