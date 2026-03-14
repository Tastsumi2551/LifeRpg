import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import XPBar from '../ui/XPBar';
import { HiHome, HiStar, HiShoppingBag, HiUser } from 'react-icons/hi2';
import { GiSwordman, GiMuscleUp } from 'react-icons/gi';
import { MdRestaurant } from 'react-icons/md';

const tabs = [
  { path: '/', icon: HiHome, label: 'Home' },
  { path: '/missions', icon: GiSwordman, label: 'Misiones' },
  { path: '/gym', icon: GiMuscleUp, label: 'Gym' },
  { path: '/nutrition', icon: MdRestaurant, label: 'Nutrición' },
  { path: '/shop', icon: HiShoppingBag, label: 'Tienda' },
  { path: '/profile', icon: HiUser, label: 'Perfil' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loaded, loadFromFirebase } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !loaded) {
      loadFromFirebase(user.uid);
    }
  }, [user, loaded, loadFromFirebase]);

  return (
    <div className="h-full flex flex-col bg-bg-deep relative z-10">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center font-display font-bold text-sm text-white">
            A
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{profile.avatar}</span>
            <span className="text-sm font-medium text-text-primary truncate max-w-[100px]">
              {profile.displayName || 'Aventurero'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <XPBar level={profile.level} xp={profile.xp} />
          <div className="flex items-center gap-1 text-gold text-sm font-mono font-semibold">
            <span>🪙</span>
            <span>{profile.coins}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="flex-shrink-0 flex items-center justify-around bg-bg-surface/90 backdrop-blur-md border-t border-border px-2 py-2 safe-area-pb">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors relative"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-accent/10 rounded-lg"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted'
                }`}
              />
              <span
                className={`text-[10px] relative z-10 transition-colors ${
                  isActive ? 'text-accent font-medium' : 'text-text-muted'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
