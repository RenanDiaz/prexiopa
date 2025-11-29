import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication. If the user is not authenticated,
 * they will be redirected to the login page. The original route is saved
 * so the user can be redirected back after successful login.
 *
 * @example
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login and save the attempted location
  if (!user) {
    // Save the location they were trying to access
    sessionStorage.setItem('redirectAfterLogin', location.pathname);

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};
