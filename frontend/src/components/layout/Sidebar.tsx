import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Heart,
  Building2,
  Users,
  Bell,
  BarChart3,
  Settings,
  Stethoscope,
  ClipboardList,
  Activity,
  UserPlus,
  PlusCircle,
  BookOpen,
  MapPin,
  Video,
  Pill,
  Clock,
  Search,
  AlertTriangle,
  Radio,
  Shield,
  CreditCard,
  FolderOpen,
  Beaker,
  Syringe,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavGroups = (): NavGroup[] => {
    const role = user?.role;

    switch (role) {
      case 'PATIENT':
        return [
          {
            items: [
              { path: '/patient', label: 'Dashboard', icon: LayoutDashboard },
              { path: '/patient/profile', label: 'My Profile', icon: User },
            ],
          },
          {
            title: 'Health Services',
            items: [
              { path: '/patient/assessment', label: 'AI Health Check', icon: Activity },
              { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
              { path: '/patient/book-appointment', label: 'Book Appointment', icon: PlusCircle },
              { path: '/patient/consultation', label: 'Teleconsultation', icon: Video },
            ],
          },
          {
            title: 'Health Records',
            items: [
              { path: '/patient/records', label: 'Medical Records', icon: FolderOpen },
              { path: '/patient/lab-reports', label: 'Lab Reports', icon: Beaker },
              { path: '/patient/vaccinations', label: 'Vaccinations', icon: Syringe },
              { path: '/patient/prescriptions', label: 'Prescriptions', icon: ClipboardList },
              { path: '/patient/monitoring', label: 'Health Metrics', icon: Heart },
              { path: '/patient/reminders', label: 'Medicine Reminders', icon: Bell },
            ],
          },
          {
            title: 'Resources',
            items: [
              { path: '/patient/emergency', label: 'Emergency SOS', icon: AlertTriangle },
              { path: '/patient/health-alerts', label: 'Health Alerts', icon: Radio },
              { path: '/patient/schemes', label: 'Govt Schemes', icon: Shield },
              { path: '/patient/insurance', label: 'Insurance & Claims', icon: CreditCard },
              { path: '/patient/facilities', label: 'Find Facility', icon: MapPin },
              { path: '/patient/doctors', label: 'Find Doctor', icon: Stethoscope },
              { path: '/patient/education', label: 'Health Education', icon: BookOpen },
              { path: '/patient/settings', label: 'Settings', icon: Settings },
            ],
          },
        ];
        
      case 'DOCTOR':
        return [
          {
            items: [
              { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
            ],
          },
          {
            title: 'Patient Care',
            items: [
              { path: '/doctor/patients', label: 'My Patients', icon: Users },
              { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
              { path: '/doctor/consultation', label: 'Consultations', icon: MessageSquare },
            ],
          },
          {
            title: 'Management',
            items: [
              { path: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
              { path: '/doctor/schedule', label: 'My Schedule', icon: Clock },
            ],
          },
        ];
        
      case 'HEALTH_WORKER':
        return [
          {
            items: [
              { path: '/worker', label: 'Dashboard', icon: LayoutDashboard },
            ],
          },
          {
            title: 'Patient Services',
            items: [
              { path: '/worker/register', label: 'Register Patient', icon: UserPlus },
              { path: '/worker/search', label: 'Find Patient', icon: Search },
              { path: '/worker/screenings', label: 'Screenings', icon: ClipboardList },
            ],
          },
          {
            title: 'Field Work',
            items: [
              { path: '/worker/vitals', label: 'Record Vitals', icon: Activity },
              { path: '/worker/referrals', label: 'Referrals', icon: FileText },
              { path: '/worker/sync', label: 'Pending Sync', icon: Clock },
            ],
          },
        ];
        
      case 'ADMIN':
        return [
          {
            items: [
              { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            ],
          },
          {
            title: 'User Management',
            items: [
              { path: '/admin/patients', label: 'Patients', icon: Users },
              { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
              { path: '/admin/workers', label: 'Health Workers', icon: UserPlus },
            ],
          },
          {
            title: 'Operations',
            items: [
              { path: '/admin/facilities', label: 'Facilities', icon: Building2 },
              { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
              { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
            ],
          },
          {
            title: 'System',
            items: [
              { path: '/admin/settings', label: 'Settings', icon: Settings },
            ],
          },
        ];
        
      default:
        return [];
    }
  };

  const navGroups = getNavGroups();

  const isItemActive = (path: string) => {
    if (path === `/${user?.role?.toLowerCase()}` || path === '/patient' || path === '/doctor' || path === '/worker' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="py-4 px-3 space-y-6">
      {navGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.title && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>
          )}
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isActive = isItemActive(item.path);
              const Icon = item.icon;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon 
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                      )} 
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Bottom section - Help & Support */}
      <div className="pt-4 border-t border-gray-200">
        <div className="px-3 py-3 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Need Help?</p>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Contact our support team for assistance.
          </p>
          <a
            href="/emergency"
            className="block w-full text-center text-xs font-medium text-primary-700 hover:text-primary-800 transition-colors"
          >
            Emergency: 112
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
