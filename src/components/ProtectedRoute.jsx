import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, token, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <LoadingSpinner fullscreen loading text="Memuat..." />;
  }

  // Redirect to login if no token or no current user
  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
