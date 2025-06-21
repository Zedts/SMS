import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { LoadingPage } from './components/ui/loading';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState(['landing']);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (showLogin) {
        setShowLogin(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showLogin]);

  const navigateToLogin = () => {
    setNavigationHistory(prev => [...prev, 'login']);
    setShowLogin(true);
    // Push state to browser history
    window.history.pushState({ page: 'login' }, 'Login', '/login');
  };

  const navigateBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      
      if (previousPage === 'landing') {
        setShowLogin(false);
        window.history.pushState({ page: 'landing' }, 'Home', '/');
      }
    } else {
      setShowLogin(false);
      window.history.pushState({ page: 'landing' }, 'Home', '/');
    }
  };

  if (loading) {
    return (
      <LoadingPage 
        message="Memuat Sistem Manajemen Siswa" 
        submessage="Mohon tunggu, sedang memverifikasi autentikasi..."
      />
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (showLogin) {
    return <LoginForm onBack={navigateBack} />;
  }

  return <LandingPage onLogin={navigateToLogin} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

