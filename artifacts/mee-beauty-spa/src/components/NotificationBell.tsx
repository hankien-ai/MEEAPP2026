import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notification.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const NotificationBell: React.FC = () => {
  const { currentStaff } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentStaff) {
      loadUnreadCount();
      // Polling mỗi 30 giây
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
    if (!isOpen) {
      try {
        const data = await notificationService.getNotifications(currentStaff.id, false);
        setNotifications(data.slice(0, 10));
      } catch (err) {
        console.error(err);
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
    try {
      await notificationService.markAllAsRead(currentStaff.id);
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
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
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 z-50">
          <div className="flex items-center justify-between p-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">Không có thông báo</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 hover:bg-slate-50 cursor-pointer ${notif.read_at ? 'opacity-70' : 'bg-blue-50'}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-slate-800">{notif.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {format(new Date(notif.created_at), 'HH:mm dd/MM', { locale: vi })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};