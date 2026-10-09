import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api-client.ts';
import { NotificationItem } from '../types/index.ts';
import { Bell, CheckCheck, Clock, ExternalLink, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  onSelectComplaint?: (complaintNumber: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onSelectComplaint }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiFetch<{ notifications: NotificationItem[]; unreadCount: number }>(
        '/api/notifications'
      );
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickItem = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    if (item.complaintNumber && onSelectComplaint) {
      onSelectComplaint(item.complaintNumber);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.2 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500">Live complaint updates and alerts</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-10 text-center px-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <Bell size={20} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-500 mt-0.5">No notifications right now.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleClickItem(item)}
                    className={`p-3.5 cursor-pointer transition-colors text-xs flex gap-3 ${
                      item.isRead ? 'bg-white hover:bg-slate-50/80' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.type === 'urgent' ? (
                        <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <Flame size={14} />
                        </div>
                      ) : item.type === 'resolved' ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 size={14} />
                        </div>
                      ) : item.type === 'reopened' ? (
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                          <ShieldAlert size={14} />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Bell size={14} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-semibold text-slate-900 truncate">{item.title}</span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">{item.message}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(item.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {item.complaintNumber && (
                          <span className="font-mono text-indigo-600 flex items-center gap-0.5">
                            {item.complaintNumber} <ExternalLink size={10} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500">
                Connected to CampusVoice Central Gateway
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
