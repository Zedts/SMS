import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Home, Clock, BookOpen, Users, UserCheck, Bell, LogOut, FileText, Clipboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ];

    switch (user.role) {
      case 'siswa':
        return [
          ...commonItems,
          { id: 'absensi', label: 'Absensi', icon: Clock },
          { id: 'tugas', label: 'Tugas', icon: BookOpen },
          { id: 'notifikasi', label: 'Notifikasi', icon: Bell }
        ];
      case 'guru':
        return [
          ...commonItems,
          { id: 'absensi', label: 'Kelola Absensi', icon: UserCheck },
          { id: 'tugas', label: 'Kelola Tugas', icon: BookOpen },
          { id: 'manage-submissions', label: 'Kelola Pengumpulan', icon: Clipboard },
          { id: 'notifikasi', label: 'Notifikasi', icon: Bell }
        ];
      case 'admin':
        return [
          ...commonItems,
          { id: 'users', label: 'Kelola Pengguna', icon: Users },
          { id: 'notifikasi', label: 'Notifikasi', icon: Bell }
        ];
      default:
        return commonItems;
    }
  };

  const handleMenuClick = (itemId) => {
    console.log('=== NAVIGATION CLICK ===');
    console.log('Navigating to:', itemId);
    console.log('Current activeTab:', activeTab);
    console.log('User role:', user.role);
    setActiveTab(itemId);
    setIsMobileMenuOpen(false); // Close mobile menu after click
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="backdrop-blur-sm bg-white/10 border-b border-white/20 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
              SMS - {user.role.toUpperCase()}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {getMenuItems().map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                    activeTab === item.id 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700" 
                      : "backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-pink-300 hover:border-white/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.label.split(' ')[0]}</span>
                  {item.id === 'notifikasi' && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1 bg-red-500/80 text-white border-0">
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-pink-200 hidden lg:block">
              Selamat datang, <span className="font-medium text-white">{user.name}</span>
            </span>
            <button
              onClick={logout}
              className="backdrop-blur-sm bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-200 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-red-600/30 hover:text-red-100 hover:border-red-400/50 transition-all duration-300 px-3 py-2 rounded-lg shadow-lg transform hover:scale-105 flex items-center space-x-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Logout */}
            <button
              onClick={logout}
              className="backdrop-blur-sm bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-200 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-red-600/30 hover:text-red-100 hover:border-red-400/50 transition-all duration-300 p-2 rounded-lg shadow-lg transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
            </button>
            
            {/* Hamburger Menu */}
            <button
              onClick={toggleMobileMenu}
              className="backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 p-2 rounded-lg shadow-lg transform hover:scale-105"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile User Info */}
              <div className="px-3 py-2 text-sm text-pink-200 border-b border-white/10 mb-2">
                Selamat datang, <span className="font-medium text-white">{user.name}</span>
              </div>
              
              {/* Mobile Menu Items */}
              {getMenuItems().map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 text-left transition-all duration-300 rounded-lg font-medium ${
                      activeTab === item.id 
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" 
                        : "backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-pink-300 hover:border-white/30"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'notifikasi' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto bg-red-500/80 text-white border-0">
                        {unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

