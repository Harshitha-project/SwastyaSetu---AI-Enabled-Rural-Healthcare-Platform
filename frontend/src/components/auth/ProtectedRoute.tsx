import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status - with minimum display time to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader size="lg" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && user) {
    const userRole = (user.role || '').toUpperCase();
    const isAllowed = allowedRoles.some(r => r.toUpperCase() === userRole);
    if (!isAllowed) {
      // Redirect to appropriate dashboard based on user role
      const dashboardPaths: Record<string, string> = {
        PATIENT: '/patient',
        DOCTOR: '/doctor',
        HEALTH_WORKER: '/worker',
        ADMIN: '/admin',
      };
      
      return <Navigate to={dashboardPaths[userRole] || '/'} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
