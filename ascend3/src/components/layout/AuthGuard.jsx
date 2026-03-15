import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';

export default function AuthGuard({ children, requireAuth = true, requireOnboarding = true }) {
  const { user, loading, error, onboardingComplete } = useAuthStore();

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-bg-deep gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full"
        />
        <p className="text-white/50 text-sm">Conectando...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-bg-deep gap-4 px-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/80 transition-colors"
        >
          Reintentar
        </button>
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
