import { useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { useAuthStore } from '../stores/authStore';

function Logo() {
  return (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="loginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e94560"/>
          <stop offset="100%" stopColor="#ff6b6b"/>
        </linearGradient>
      </defs>
      <path d="M50 10 L78 24 L78 54 C78 72 64 83 50 90 C36 83 22 72 22 54 L22 24 Z"
        stroke="url(#loginGrad)" strokeWidth="4" fill="none"/>
      <path d="M50 35 L42 49 L47 49 L47 62 L53 62 L53 49 L58 49 Z"
        fill="url(#loginGrad)"/>
    </svg>
  );
}

export default function Login() {
  const { loginWithGoogle, loginWithEmail, register } = useAuth();
  const { error, loading } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    isRegister ? register(email, password) : loginWithEmail(email, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'var(--bg-0)',
    }}>
      <div style={{ maxWidth: 380, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <Logo />
          </div>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>
            Ascend
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>
            Sistema de progresion personal
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: 20,
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}>
            {isRegister ? 'Crear cuenta' : 'Iniciar sesion'}
          </h2>

          {error && (
            <div style={{
              background: 'var(--danger-muted)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius)',
              padding: '10px 12px',
              marginBottom: 14,
              fontSize: '0.82rem',
              color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo electronico</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contrasena</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                  }}
                >
                  {showPw ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesion'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-disabled)', fontSize: '0.75rem', fontWeight: 500 }}>o</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            onClick={loginWithGoogle}
            className="btn-secondary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <p style={{
            textAlign: 'center',
            marginTop: 18,
            fontSize: '0.82rem',
            color: 'var(--text-tertiary)',
          }}>
            {isRegister ? 'Ya tienes cuenta? ' : 'No tienes cuenta? '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                fontFamily: 'inherit',
              }}
            >
              {isRegister ? 'Iniciar sesion' : 'Registrate'}
            </button>
          </p>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: '0.72rem',
          color: 'var(--text-disabled)',
        }}>
          Tus datos se guardan de forma segura
        </p>
      </div>
    </div>
  );
}
