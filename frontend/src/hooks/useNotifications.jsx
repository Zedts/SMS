import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { api } from '../lib/api';

export const useNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await api.getNotifikasi(token);
      if (response.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await api.getUnreadNotifikasiCount(token);
      if (response.success) {
        setUnreadCount(response.count);
      } else {
        console.error('Failed to fetch unread count:', response.message);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, [token]);

  const markAsRead = async (id) => {
    if (!token) return;
    
    try {
      // Update UI state optimistically terlebih dahulu
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, dibaca: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Kemudian sync dengan server
      const response = await api.markNotifikasiAsRead(token, id);
      if (!response.success) {
        // Jika gagal, kembalikan state semula
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, dibaca: false } : notif
          )
        );
        setUnreadCount(prev => prev + 1);
        console.error('Failed to mark notification as read:', response.message);
      }
    } catch (error) {
      // Jika error, kembalikan state semula
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, dibaca: false } : notif
        )
      );
      setUnreadCount(prev => prev + 1);
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      // Simpan state lama untuk rollback jika perlu
      const previousUnreadCount = unreadCount;
      
      // Update UI state optimistically
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, dibaca: true }))
      );
      setUnreadCount(0);

      // Sync dengan server
      const response = await api.markAllNotifikasiAsRead(token);
      if (!response.success) {
        // Jika gagal, kembalikan state semula
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, dibaca: false }))
        );
        setUnreadCount(previousUnreadCount);
        console.error('Failed to mark all notifications as read:', response.message);
      }
    } catch (error) {
      // Jika error, fetch ulang untuk mendapatkan state yang benar
      fetchNotifications();
      fetchUnreadCount();
      console.error('Error marking all notifications as read:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.dibaca) {
      setUnreadCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Setup polling untuk auto-update notifikasi setiap 30 detik
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000); // 30 detik untuk production

    // Setup event listener untuk refresh saat user kembali ke tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User kembali ke tab, refresh notifikasi
        fetchNotifications();
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Setup event listener untuk refresh saat window focus
    const handleWindowFocus = () => {
      fetchNotifications();
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleWindowFocus);

    // Cleanup listeners dan interval saat component unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };
};

