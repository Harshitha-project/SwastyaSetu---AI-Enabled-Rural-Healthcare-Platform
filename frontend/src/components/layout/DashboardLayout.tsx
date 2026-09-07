import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { IncomingCallModal } from '../teleconsultation/IncomingCallModal';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  Menu,
  X,
  Bell,
  Globe,
  ChevronDown,
  LogOut,
  User,
  Settings,
  WifiOff,
} from 'lucide-react';

interface DashboardLayoutProps {
  role?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = () => {
  const { i18n } = useTranslation();
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setLangMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    localStorage.setItem('i18nextLng', langCode);
    setLangMenuOpen(false);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if ((user as any)?.name) {
      return (user as any).name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if ((user as any)?.name) {
      return (user as any).name;
    }
    return user?.email || 'User';
  };

  const getRoleBadgeVariant = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'destructive';
      case 'DOCTOR':
        return 'default';
      case 'HEALTH_WORKER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-white overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium">
              <WifiOff className="h-4 w-4" />
              <span>You're offline. Some features may be limited.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* Left: Toggle & Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">
                SwasthyaSetu
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative" data-dropdown>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setLangMenuOpen(!langMenuOpen);
                  setUserMenuOpen(false);
                }}
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">
                  {languages.find(l => l.code === i18n.language)?.name || 'EN'}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              
              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                          i18n.language === lang.code
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </Button>

            <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />

            {/* User Menu */}
            <div className="relative" data-dropdown>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                  setLangMenuOpen(false);
                }}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary-100">
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-sm font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {getUserDisplayName()}
                  </p>
                  <Badge variant={getRoleBadgeVariant()} className="text-[10px] px-1.5 py-0 h-4">
                    {user?.role?.replace('_', ' ')}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4 text-gray-400" />
                        View Profile
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="h-4 w-4 text-gray-400" />
                        Settings
                      </button>
                    </div>
                    <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/70">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                        Switch Active Role (Tab Isolated)
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            switchRole?.('PATIENT');
                            setUserMenuOpen(false);
                            navigate('/patient');
                          }}
                          className={`px-2 py-1.5 rounded-lg text-left transition-colors font-medium flex items-center gap-1.5 ${
                            user?.role === 'PATIENT'
                              ? 'bg-primary-100 text-primary-800 font-semibold'
                              : 'hover:bg-gray-200/70 text-gray-700'
                          }`}
                        >
                          <span>👤</span> Patient
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            switchRole?.('DOCTOR');
                            setUserMenuOpen(false);
                            navigate('/doctor');
                          }}
                          className={`px-2 py-1.5 rounded-lg text-left transition-colors font-medium flex items-center gap-1.5 ${
                            user?.role === 'DOCTOR'
                              ? 'bg-primary-100 text-primary-800 font-semibold'
                              : 'hover:bg-gray-200/70 text-gray-700'
                          }`}
                        >
                          <span>🩺</span> Doctor
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            switchRole?.('HEALTH_WORKER');
                            setUserMenuOpen(false);
                            navigate('/worker');
                          }}
                          className={`px-2 py-1.5 rounded-lg text-left transition-colors font-medium flex items-center gap-1.5 ${
                            user?.role === 'HEALTH_WORKER'
                              ? 'bg-primary-100 text-primary-800 font-semibold'
                              : 'hover:bg-gray-200/70 text-gray-700'
                          }`}
                        >
                          <span>🛡️</span> Worker
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            switchRole?.('ADMIN');
                            setUserMenuOpen(false);
                            navigate('/admin');
                          }}
                          className={`px-2 py-1.5 rounded-lg text-left transition-colors font-medium flex items-center gap-1.5 ${
                            user?.role === 'ADMIN'
                              ? 'bg-primary-100 text-primary-800 font-semibold'
                              : 'hover:bg-gray-200/70 text-gray-700'
                          }`}
                        >
                          <span>⚙️</span> Admin
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200/50 overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 w-72 h-full bg-white z-50 lg:hidden shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">SwasthyaSetu</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                  <Sidebar />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] lg:ml-0 pb-20 lg:pb-6">
          <div className="p-4 lg:p-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Phone Native-Style Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Incoming Call Alert Modal */}
      <IncomingCallModal />
    </div>
  );
};

export default DashboardLayout;
