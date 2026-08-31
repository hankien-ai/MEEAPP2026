// src/components/NotificationBell.tsx
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notification.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Notification {
  id: string;
  staff_id: string;
  type: string;
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  read_at?: string;
  created_at: string;
}

export const NotificationBell: React.FC = () => {
  const { currentStaff } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentStaff) {
      loadNotifications();
      // Auto refresh mỗi 30 giây
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentStaff]);

  const loadNotifications = async () => {
    if (!currentStaff) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(currentStaff.id, false);
      setNotifications(data.slice(0, 20));
      const unread = await notificationService.getUnreadCount(currentStaff.id);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Lỗi tải notification:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentStaff) return;
    try {
      await notificationService.markAllAsRead(currentStaff.id);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm dd/MM', { locale: vi });
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-1.5 hover:bg-slate-100 rounded-full transition-colors"
        title="Thông báo"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50/80">
            <h3 className="text-sm font-bold text-slate-800">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Đọc tất cả
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
                <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full mr-2" />
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-sm">
                <Bell className="w-10 h-10 text-slate-300 mb-2" />
                Không có thông báo
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                    notif.read_at ? 'opacity-70' : 'bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{notif.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatTime(notif.created_at)}</p>
                    </div>
                    {!notif.read_at && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};