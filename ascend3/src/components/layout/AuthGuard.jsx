import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';

export default function AuthGuard({ children, requireAuth = true, requireOnboarding = true }) {
  const { user, loading, onboardingComplete } = useAuthStore();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-deep">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full"
        />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user && onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  if (requireOnboarding && user && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
