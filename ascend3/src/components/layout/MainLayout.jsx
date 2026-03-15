import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';

const NAV = [
  { path: '/', label: 'Inicio', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { path: '/missions', label: 'Misiones', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
  )},
  { path: '/schedule', label: 'Horario', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  { path: '/arsenal', label: 'Arsenal', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
  )},
  { path: '/finance', label: 'Finanzas', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  )},
  { path: '/profile', label: 'Perfil', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
];

// Shield logo component
function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e94560"/>
          <stop offset="100%" stopColor="#ff6b6b"/>
        </linearGradient>
      </defs>
      <path d="M50 10 L78 24 L78 54 C78 72 64 83 50 90 C36 83 22 72 22 54 L22 24 Z"
        stroke="url(#logoGrad)" strokeWidth="4" fill="none"/>
      <path d="M50 35 L42 49 L47 49 L47 62 L53 62 L53 49 L58 49 Z"
        fill="url(#logoGrad)"/>
    </svg>
  );
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    loaded, loadFromFirebase, getPlayerLevel,
    displayName, coins, notifications,
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
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Cargando...</p>
      </div>
    );
  }

  const level = getPlayerLevel();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header style={{
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo />
          <div>
            <div style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}>
              Ascend
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {displayName || 'Jugador'} · Nv. {level}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="coin-display">
            <span style={{ fontSize: '0.75rem' }}>🪙</span> {coins}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{
        flex: 1,
        padding: '24px 16px',
        paddingBottom: 72,
        maxWidth: 860,
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
        background: 'var(--bg-1)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '4px 0 6px',
        zIndex: 50,
        backdropFilter: 'blur(12px)',
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
                gap: 2,
                padding: '4px 8px',
                minWidth: 0,
                color: active ? 'var(--accent)' : 'var(--text-disabled)',
                transition: 'color 0.15s',
              }}
            >
              {item.icon}
              <span style={{
                fontSize: '0.58rem',
                fontWeight: 600,
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
