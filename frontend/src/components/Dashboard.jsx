import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ResponsiveLayout from './ResponsiveLayout';
import SiswaDashboard from './dashboard/SiswaDashboard';
import GuruDashboard from './dashboard/GuruDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import AbsensiPage from './AbsensiPage';
import TugasPage from './TugasPage';
import UsersPage from './UsersPage';
import NotifikasiPage from './NotifikasiPage';
import ManageSubmissionsPage from './ManageSubmissionsPage';
import { LoadingCard } from './ui/loading';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize with URL hash if available
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });
  const [contentLoading, setContentLoading] = useState(false);

  // Handle browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const newTab = hash || 'dashboard';
      console.log('Hash changed to:', newTab);
      setActiveTab(newTab);
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL when tab changes (but prevent infinite loop)
  const handleTabChange = (newTab) => {
    console.log('=== TAB CHANGE ===');
    console.log('Changing tab to:', newTab);
    setActiveTab(newTab);
    
    // Update URL hash
    if (newTab === 'dashboard') {
      window.location.hash = '';
    } else {
      window.location.hash = newTab;
    }
  };

  // Add loading state when switching tabs
  useEffect(() => {
    setContentLoading(true);
    const timer = setTimeout(() => setContentLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const renderContent = () => {
    console.log('=== RENDER CONTENT ===');
    console.log('Current activeTab:', activeTab);
    console.log('User role:', user.role);
    console.log('Content loading:', contentLoading);
    
    if (contentLoading) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-lg font-medium">Memuat halaman...</p>
            <p className="text-pink-200 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      );
    }

    try {
      switch (activeTab) {
        case 'dashboard':
          console.log('Rendering dashboard for role:', user.role);
          if (user.role === 'siswa') return <SiswaDashboard key="siswa-dashboard" />;
          if (user.role === 'guru') return <GuruDashboard key="guru-dashboard" />;
          if (user.role === 'admin') return <AdminDashboard key="admin-dashboard" />;
          return <div className="p-6">Error: Role tidak dikenali - {user.role}</div>;
        case 'absensi':
          console.log('Rendering AbsensiPage for role:', user.role);
          return <AbsensiPage key={`absensi-${activeTab}`} />;
        case 'tugas':
          console.log('Rendering TugasPage for role:', user.role);
          return <TugasPage key={`tugas-${activeTab}`} />;
        case 'users':
          console.log('Rendering UsersPage for role:', user.role);
          if (user.role === 'admin') {
            return <UsersPage key={`users-${activeTab}`} />;
          }
          return <div className="min-h-[60vh] flex items-center justify-center">
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">!</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Akses Ditolak</h2>
              <p className="text-pink-200 leading-relaxed">Hanya admin yang dapat mengakses halaman ini</p>
            </div>
          </div>;
        case 'notifikasi':
          console.log('Rendering NotifikasiPage for role:', user.role);
          return <NotifikasiPage key={`notifikasi-${activeTab}`} />;
        case 'manage-submissions':
          console.log('Rendering ManageSubmissionsPage for guru', 'activeTab:', activeTab);
          if (user.role === 'guru') {
            return <ManageSubmissionsPage />;
          }
          return <div className="min-h-[60vh] flex items-center justify-center">
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">!</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Akses Ditolak</h2>
              <p className="text-pink-200 leading-relaxed">Hanya guru yang dapat mengakses halaman ini</p>
            </div>
          </div>;
        default:
          console.warn('Unknown tab:', activeTab);
          return (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">?</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Halaman Tidak Ditemukan</h2>
                <p className="text-pink-200 mb-6 leading-relaxed">Halaman "{activeTab}" yang Anda cari tidak tersedia.</p>
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering content:', error);        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">✗</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Terjadi Kesalahan</h2>
              <p className="text-pink-200 mb-6 leading-relaxed">Silakan refresh halaman atau coba lagi.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Refresh Halaman
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <ResponsiveLayout activeTab={activeTab} setActiveTab={handleTabChange}>
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-orange-500/5 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 transition-all duration-300 ease-in-out">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </ResponsiveLayout>
  );
};

export default Dashboard;