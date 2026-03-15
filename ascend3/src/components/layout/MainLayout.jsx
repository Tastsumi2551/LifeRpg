import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Inicio' },
  { path: '/missions', icon: '🎯', label: 'Misiones' },
  { path: '/schedule', icon: '📅', label: 'Horario' },
  { path: '/battle', icon: '🛡️', label: 'Batalla' },
  { path: '/profile', icon: '👤', label: 'Perfil' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loaded, loadFromFirebase, getPlayerLevel, displayName } = useGameStore();

  useEffect(() => {
    if (user && !loaded) {
      loadFromFirebase(user.uid);
    }
  }, [user, loaded, loadFromFirebase]);

  if (!loaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Cargando datos...</p>
      </div>
    );
  }

  const playerLevel = getPlayerLevel();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.4rem' }}>⚔️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>
              LIFE RPG
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {displayName || 'Jugador'} · Nv. {playerLevel}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: '20px', paddingBottom: '80px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
        zIndex: 50,
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '4px 12px',
                opacity: isActive ? 1 : 0.5,
                transition: 'opacity 0.2s',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
