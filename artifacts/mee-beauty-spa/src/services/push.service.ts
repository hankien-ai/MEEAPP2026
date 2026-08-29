// src/services/push.service.ts
import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from './supabase';

export interface PushSubscription {
  id: string;
  staff_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  organization_id: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export const pushService = {
  async registerSubscription(staffId: string, subscription: PushSubscription): Promise<void> {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        staff_id: staffId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        user_agent: subscription.user_agent,
        organization_id: DEFAULT_ORG_ID,
        branch_id: DEFAULT_BRANCH_ID,
      }, { onConflict: 'endpoint' });
    if (error) throw error;
  },

  async sendPushNotification(staffId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      // Gọi Edge Function để gửi push
      const { error } = await supabase.functions.invoke('send-notification', {
        body: { staffId, title, body, data },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Lỗi gửi push notification:', err);
      // Không throw lỗi để không ảnh hưởng luồng chính
    }
  },

  // Helper để đăng ký service worker và push manager
  async setupPush(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Permission not granted');
        return;
      }

      // Lấy VAPID public key từ env
      const applicationServerKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!applicationServerKey) {
        console.warn('VITE_VAPID_PUBLIC_KEY not set');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const subData = {
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        user_agent: navigator.userAgent,
      };

      // Lấy staff từ localStorage
      const staff = JSON.parse(localStorage.getItem('mee_staff_profile') || '{}');
      if (staff.id) {
        await this.registerSubscription(staff.id, subData);
        console.log('Push subscription registered');
      }
    } catch (err) {
      console.error('Push setup error:', err);
    }
  },
};