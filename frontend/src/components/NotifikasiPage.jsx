import { useNotifications } from '../hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { LoadingCard } from './ui/loading';

const NotifikasiPage = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead
  } = useNotifications();

  const getNotificationIcon = (tipe) => {
    switch (tipe) {
      case 'tugas_baru':
        return <BookOpen className="w-5 h-5 text-pink-500" />;
      case 'tugas_terlambat':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'tugas_dinilai':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absen_pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'absen_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absen_rejected':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (tipe) => {
    switch (tipe) {
      case 'tugas_baru':
        return <span className="px-2 py-1 bg-gradient-to-r from-pink-500/20 to-pink-600/20 text-pink-300 text-xs font-semibold rounded-full border border-pink-500/30">Tugas Baru</span>;
      case 'tugas_terlambat':
        return <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">Tugas Terlambat</span>;
      case 'tugas_dinilai':
        return <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">Tugas Dinilai</span>;
      case 'absen_pending':
        return <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/30">Absen Pending</span>;
      case 'absen_approved':
        return <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">Absen Disetujui</span>;
      case 'absen_rejected':
        return <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">Absen Ditolak</span>;
      default:
        return <span className="px-2 py-1 bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 text-xs font-semibold rounded-full border border-gray-500/30">{tipe}</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Baru saja';
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} hari yang lalu`;
    }
  };

  if (loading) {
    return <LoadingCard message="Memuat notifikasi..." />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Notifikasi
          </h1>
          <p className="text-pink-200 text-sm sm:text-base">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      {/* Notifikasi List */}
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-[1.02] ${
              !notif.dibaca ? 'bg-gradient-to-r from-pink-500/10 to-orange-500/10 border-pink-500/30' : ''
            }`}
            onClick={() => !notif.dibaca && markAsRead(notif.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getNotificationIcon(notif.tipe)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {notif.judul}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getNotificationBadge(notif.tipe)}
                    {!notif.dibaca && (
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                <p className="text-pink-200 mb-2">{notif.pesan}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pink-300">
                    {formatDate(notif.created_at)}
                  </span>
                  {!notif.dibaca && (
                    <button
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-3 py-1 rounded-lg text-sm shadow-lg transform hover:scale-105 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-12 text-center shadow-2xl">
          <Bell className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Tidak ada notifikasi
          </h3>
          <p className="text-pink-200">
            Notifikasi akan muncul di sini ketika ada aktivitas baru
          </p>
        </div>
      )}

      {/* Statistik Notifikasi */}
      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Statistik Notifikasi</h2>
          <p className="text-pink-200">Ringkasan notifikasi Anda</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="text-center p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
              {notifications.length}
            </div>
            <p className="text-sm text-pink-200 font-medium">Total Notifikasi</p>
          </div>
          <div className="text-center p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              {unreadCount}
            </div>
            <p className="text-sm text-pink-200 font-medium">Belum Dibaca</p>
          </div>
          <div className="text-center p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              {notifications.length - unreadCount}
            </div>
            <p className="text-sm text-pink-200 font-medium">Sudah Dibaca</p>
          </div>
        </div>
      </div>

      {/* Jenis Notifikasi */}
      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Jenis Notifikasi</h2>
          <p className="text-pink-200">Distribusi notifikasi berdasarkan jenis</p>
        </div>
        <div className="space-y-3">
          {['tugas_baru', 'tugas_terlambat', 'tugas_dinilai', 'absen_pending', 'absen_approved', 'absen_rejected'].map((tipe) => {
            const count = notifications.filter(n => n.tipe === tipe).length;
            const percentage = notifications.length > 0 ? (count / notifications.length * 100).toFixed(1) : 0;
            
            return (
              <div key={tipe} className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center space-x-3">
                  {getNotificationIcon(tipe)}
                  <span className="font-medium text-white">
                    {tipe === 'tugas_baru' && 'Tugas Baru'}
                    {tipe === 'tugas_terlambat' && 'Tugas Terlambat'}
                    {tipe === 'tugas_dinilai' && 'Tugas Dinilai'}
                    {tipe === 'absen_pending' && 'Absen Pending'}
                    {tipe === 'absen_approved' && 'Absen Disetujui'}
                    {tipe === 'absen_rejected' && 'Absen Ditolak'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{count}</div>
                  <div className="text-sm text-pink-300">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotifikasiPage;

