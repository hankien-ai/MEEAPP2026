// src/services/notification.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from './supabase';

export interface Notification {
  id: string;
  organization_id: string;
  branch_id: string;
  staff_id: string;
  type: 'APPOINTMENT' | 'TASK' | 'TASK_REMINDER' | 'TASK_OVERDUE' | 'SYSTEM';
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export const notificationService = {
  async getNotifications(staffId: string, unreadOnly = false): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('staff_id', staffId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        organization_id: DEFAULT_ORG_ID,
        branch_id: DEFAULT_BRANCH_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
    if (error) throw error;
  },

  async markAllAsRead(staffId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('staff_id', staffId)
      .is('read_at', null)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID);
    if (error) throw error;
  },

  async getUnreadCount(staffId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('staff_id', staffId)
      .is('read_at', null)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID);
    if (error) return 0;
    return count || 0;
  },
};