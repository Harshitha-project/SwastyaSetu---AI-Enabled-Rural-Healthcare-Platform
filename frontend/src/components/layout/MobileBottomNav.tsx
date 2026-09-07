import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  Home,
  Calendar,
  Video,
  FileText,
  Activity,
  Users,
  UserPlus,
  Compass,
  BarChart3,
  Shield,
  Building,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const role = user?.role || 'PATIENT';

  interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  let navItems: NavItem[] = [];

  if (role === 'DOCTOR') {
    navItems = [
      { to: '/doctor/dashboard', label: t('sidebar.dashboard', 'Dashboard'), icon: Home },
      { to: '/doctor/appointments', label: t('sidebar.appointments', 'Schedule'), icon: Calendar },
      { to: '/doctor/consultation/apt-001', label: t('sidebar.teleconsultation', 'Consult'), icon: Video },
      { to: '/doctor/patients', label: t('sidebar.patients', 'Patients'), icon: Users },
      { to: '/doctor/analytics', label: t('sidebar.analytics', 'Analytics'), icon: BarChart3 },
    ];
  } else if (role === 'HEALTH_WORKER') {
    navItems = [
      { to: '/health-worker/dashboard', label: t('sidebar.dashboard', 'Dashboard'), icon: Home },
      { to: '/health-worker/register-patient', label: t('sidebar.registerPatient', 'Register'), icon: UserPlus },
      { to: '/health-worker/camps', label: t('sidebar.camps', 'Camps'), icon: Compass },
      { to: '/health-worker/patients', label: t('sidebar.patients', 'Patients'), icon: Users },
      { to: '/health-worker/referrals', label: t('sidebar.referrals', 'Referrals'), icon: FileText },
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { to: '/admin/dashboard', label: t('sidebar.dashboard', 'Dashboard'), icon: Home },
      { to: '/admin/users', label: t('sidebar.users', 'Users'), icon: Users },
      { to: '/admin/facilities', label: t('sidebar.facilities', 'Centers'), icon: Building },
      { to: '/admin/analytics', label: t('sidebar.analytics', 'Reports'), icon: BarChart3 },
      { to: '/admin/audit-logs', label: t('sidebar.auditLogs', 'Security'), icon: Shield },
    ];
  } else {
    // Default Patient
    navItems = [
      { to: '/patient/dashboard', label: t('sidebar.dashboard', 'Home'), icon: Home },
      { to: '/patient/appointments', label: t('sidebar.appointments', 'Queue/Apts'), icon: Calendar },
      { to: '/patient/teleconsultation', label: t('sidebar.teleconsultation', 'Doctor Call'), icon: Video },
      { to: '/patient/medical-records', label: t('sidebar.records', 'Records'), icon: FileText },
      { to: '/patient/lab-reports', label: t('sidebar.labReports', 'Lab Reports'), icon: Activity },
    ];
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)' }}
    >
      <div className="grid grid-cols-5 items-center px-1 py-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            (item.to !== '/patient/dashboard' &&
              item.to !== '/doctor/dashboard' &&
              item.to !== '/health-worker/dashboard' &&
              location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-teal-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-sm scale-110'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-tight tracking-tight mt-0.5 truncate max-w-[64px] text-center">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-teal-600" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
