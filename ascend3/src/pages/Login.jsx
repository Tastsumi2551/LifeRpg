import { useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, register } = useAuth();
  const { error, loading } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      register(email, password);
    } else {
      loginWithEmail(email, password);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'var(--bg-primary)',
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>⚔️</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
            LIFE RPG
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tu vida como videojuego
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>

          {error && (
            <div style={{
              background: '#7f1d1d',
              border: '1px solid #991b1b',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: '0.85rem',
              color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
            </button>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '20px 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span>o</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            onClick={loginWithGoogle}
            className="btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            disabled={loading}
          >
            <span style={{ fontSize: '1.2rem' }}>G</span>
            Continuar con Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              {isRegister ? 'Iniciar sesión' : 'Regístrate'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
