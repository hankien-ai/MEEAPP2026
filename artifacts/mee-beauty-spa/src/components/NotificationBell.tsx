// src/components/NotificationBell.tsx
import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notification.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const NotificationBell: React.FC = () => {
  const { currentStaff, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentStaff) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentStaff]);

  const loadUnreadCount = async () => {
    if (!currentStaff) return;
    try {
      const count = await notificationService.getUnreadCount(currentStaff.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Lỗi lấy số thông báo chưa đọc:', err);
    }
  };

  const toggleDropdown = async () => {
    if (!currentStaff) return;
    if (!isOpen) {
      setLoading(true);
      try {
        const data = await notificationService.getNotifications(currentStaff.id, false);
        setNotifications(data.slice(0, 20));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentStaff) return;
    try {
      await notificationService.markAllAsRead(currentStaff.id);
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    // Nếu có reference_type và reference_id, có thể điều hướng
    // Ví dụ: if (notif.reference_type === 'appointment') navigate('/appointments')
    // Tạm thời đóng dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 z-50">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 sticky top-0 bg-white">
            <h3 className="text-sm font-bold text-slate-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Đọc tất cả
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-400">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">Không có thông báo</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read_at ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{notif.title}</div>
                      <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {format(new Date(notif.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    {!notif.read_at && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
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