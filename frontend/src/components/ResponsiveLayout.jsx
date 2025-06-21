import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { 
  Home, 
  Clock, 
  BookOpen, 
  Users, 
  UserCheck, 
  Bell, 
  LogOut, 
  FileText, 
  Clipboard, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '../hooks/use-mobile';

const ResponsiveLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    
    // Close mobile sidebar after navigation
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const MenuItem = ({ item, isActive }) => {
    const Icon = item.icon;
    const isCollapsed = !isMobile && isSidebarCollapsed;
    
    return (
      <button
        onClick={() => handleMenuClick(item.id)}
        className={`w-full flex items-center space-x-3 px-3 py-3 text-left transition-all duration-300 rounded-lg group relative ${
          isActive 
            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" 
            : "text-white hover:bg-white/10 hover:text-pink-300"
        }`}
        title={isCollapsed ? item.label : ''}
      >
        <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
        {!isCollapsed && (
          <>
            <span className="font-medium">{item.label}</span>
            {item.id === 'notifikasi' && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto bg-red-500/80">
                {unreadCount}
              </Badge>
            )}
          </>
        )}
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
            {item.label}
            {item.id === 'notifikasi' && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 bg-red-500/80">
                {unreadCount}
              </Badge>
            )}
          </div>
        )}
      </button>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-black">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Backdrop for mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }` 
          : `relative transition-all duration-300 ${
              isSidebarCollapsed ? 'w-16' : 'w-64'
            }`
        }
        backdrop-blur-sm bg-white/10 border-r border-white/20 shadow-2xl
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
            {(!isSidebarCollapsed || isMobile) && (
              <h1 className="text-lg font-bold bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
                SMS - {user.role.toUpperCase()}
              </h1>
            )}
            
            {/* Collapse button for desktop */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
            
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {getMenuItems().map((item) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                isActive={activeTab === item.id}
              />
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="border-t border-white/20 p-4 space-y-3">
            {(!isSidebarCollapsed || isMobile) && (
              <div className="text-sm text-pink-200">
                <div className="font-medium text-white">{user.name}</div>
                <div className="text-xs opacity-75">{user.email}</div>
              </div>
            )}
            
            <button
              onClick={logout}
              className={`
                w-full backdrop-blur-sm bg-red-500/20 border border-red-500/30 text-red-200 
                hover:bg-red-500/30 hover:text-red-100 hover:border-red-400/50 
                transition-all duration-300 rounded-lg shadow-lg transform hover:scale-105 
                flex items-center space-x-2 text-sm font-medium
                ${isSidebarCollapsed && !isMobile ? 'p-2 justify-center' : 'px-3 py-2'}
              `}
              title={isSidebarCollapsed && !isMobile ? 'Logout' : ''}
            >
              <LogOut className="w-4 h-4" />
              {(!isSidebarCollapsed || isMobile) && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar for Mobile */}
        <div className="md:hidden backdrop-blur-sm bg-white/10 border-b border-white/20 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 p-2 rounded-lg shadow-lg transform hover:scale-105"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
              SMS - {user.role.toUpperCase()}
            </h1>
            
            <button
              onClick={logout}
              className="backdrop-blur-sm bg-red-500/20 border border-red-500/30 text-red-200 hover:bg-red-500/30 hover:text-red-100 hover:border-red-400/50 transition-all duration-300 p-2 rounded-lg shadow-lg transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ResponsiveLayout;
