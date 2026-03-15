import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';

const NAV = [
  { path: '/', icon: '🏠', label: 'Inicio' },
  { path: '/missions', icon: '🎯', label: 'Misiones' },
  { path: '/schedule', icon: '📅', label: 'Horario' },
  { path: '/arsenal', icon: '⚔️', label: 'Arsenal' },
  { path: '/finance', icon: '💰', label: 'Finanzas' },
  { path: '/profile', icon: '👤', label: 'Perfil' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    loaded, loadFromFirebase, getPlayerLevel,
    displayName, avatar, coins, notifications,
  } = useGameStore();

  useEffect(() => {
    if (user && !loaded) {
      loadFromFirebase(user.uid);
    }
  }, [user, loaded, loadFromFirebase]);

  if (!loaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cargando datos...</p>
      </div>
    );
  }

  const level = getPlayerLevel();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>⚔️</span>
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'var(--accent)',
              letterSpacing: '0.03em',
              lineHeight: 1.2,
            }}>
              LIFE RPG
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {displayName || 'Jugador'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Coins */}
          <div className="coin-display">
            <span>🪙</span> {coins}
          </div>
          {/* Level */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-primary)',
            padding: '5px 12px',
            borderRadius: 20,
            border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '1rem' }}>{avatar}</span>
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)' }}>Nv. {level}</span>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{
        flex: 1,
        padding: '20px 16px',
        paddingBottom: 80,
        maxWidth: 960,
        margin: '0 auto',
        width: '100%',
      }}>
        <Outlet />
      </main>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '6px 0 8px',
        zIndex: 50,
      }}>
        {NAV.map((item) => {
          const active = location.pathname === item.path;
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
                gap: 1,
                padding: '3px 8px',
                minWidth: 0,
              }}
            >
              <span style={{
                fontSize: '1.15rem',
                opacity: active ? 1 : 0.4,
                transition: 'opacity 0.15s',
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: active ? 'var(--accent)' : 'var(--text-dim)',
                transition: 'color 0.15s',
                letterSpacing: '0.02em',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Notifications ── */}
      {notifications.length > 0 && (
        <div className="notification-stack">
          {notifications.map((n) => (
            <div key={n.id} className="notification level-up">
              {n.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
