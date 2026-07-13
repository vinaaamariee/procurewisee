'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import {
  getNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction
} from '@/app/actions/notifications';

interface Notification {
  id: string;
  title: string;
  description: string;
  icon: string;
  role: string | null;
  userId: string | null;
  isRead: boolean;
  createdAt: Date | string;
}

interface NotificationBellProps {
  currentUser: {
    id: string;
    fullName: string;
    role: string;
  };
}

export default function NotificationBell({ currentUser }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const res = await getNotificationsAction(currentUser.role, currentUser.id);
    if (res.success && res.notifications) {
      setNotifications(res.notifications as any);
    }
  };

  // Initial fetch and poll every 10 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationAsReadAction(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllNotificationsAsReadAction(currentUser.role, currentUser.id);
  };

  const formatRelativeTime = (dateStr: Date | string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef} className="no-print">
      {/* Bell Button Triggers Dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          color: 'var(--text-secondary)',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        className="hover:bg-gray-50 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-amber-500"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#dc2626',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            borderRadius: '999px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 0 0 2px var(--surface)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '46px',
          right: 0,
          width: '320px',
          maxHeight: '420px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          boxShadow: 'var(--shadow-card)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--accent-glass)',
          }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
                className="hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List items */}
          <div style={{
            overflowY: 'auto',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 500
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔔</div>
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    background: item.isRead ? 'transparent' : 'rgba(126, 25, 27, 0.03)',
                    cursor: item.isRead ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className={item.isRead ? '' : 'hover:bg-red-500/5'}
                >
                  {/* Left status icon */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: item.isRead ? 'rgba(0,0,0,0.03)' : 'rgba(126, 25, 27, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}>
                    {item.icon}
                  </div>

                  {/* Text details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flexGrow: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: item.isRead ? 600 : 800,
                      color: 'var(--text-primary)'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.35
                    }}>
                      {item.description}
                    </div>
                    <div style={{
                      fontSize: '0.62rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.1rem',
                      fontWeight: 600
                    }}>
                      {formatRelativeTime(item.createdAt)}
                    </div>
                  </div>

                  {/* Unread circle badge */}
                  {!item.isRead && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      alignSelf: 'center',
                      flexShrink: 0
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
