import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/useAuth';
import { useAuthStore } from '../stores/authStore';
import { FcGoogle } from 'react-icons/fc';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

export default function Login() {
  const { user, loading, error, onboardingComplete } = useAuthStore();
  const { loginWithGoogle, loginWithEmail, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user && onboardingComplete) return <Navigate to="/" replace />;
  if (user && !onboardingComplete) return <Navigate to="/onboarding" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (isRegister) {
      await register(email, password);
    } else {
      await loginWithEmail(email, password);
    }
    setSubmitting(false);
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="h-full overflow-y-auto bg-bg-deep relative z-10">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm flex flex-col items-center gap-8"
        >
          {/* Logo */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center glow-accent">
              <span className="font-display text-4xl font-bold text-white">A</span>
            </div>
            <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">
              ASCEND
            </h1>
            <p className="text-text-secondary text-sm text-center">Level Up Your Life</p>
          </motion.div>

          {/* Description */}
          <motion.p variants={fadeUp} className="text-text-muted text-sm text-center leading-relaxed">
            Convierte tu vida en un RPG. Sube de nivel, cumple misiones, entrena tu cuerpo.
          </motion.p>

          {/* Features */}
          <motion.div variants={fadeUp} className="flex gap-4 text-center">
            {[
              { icon: '🐉', text: 'Tu mascota crece contigo' },
              { icon: '⚔️', text: 'Misiones diarias' },
              { icon: '🏋️', text: 'Gym tracker' },
            ].map((f) => (
              <div key={f.text} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-[11px] text-text-muted leading-tight">{f.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Google Sign In */}
          <motion.button
            variants={fadeUp}
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <FcGoogle className="w-5 h-5" />
            Continuar con Google
          </motion.button>

          {/* Divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-muted text-xs">o</span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          {/* Email Form */}
          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-red text-xs bg-red/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                isRegister ? 'Crear cuenta' : 'Iniciar sesión'
              )}
            </button>
          </motion.form>

          {/* Toggle */}
          <motion.p variants={fadeUp} className="text-text-muted text-sm">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                useAuthStore.getState().clearError();
              }}
              className="text-accent hover:text-accent2 font-medium transition-colors"
            >
              {isRegister ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </motion.p>

          {/* Footer */}
          <motion.p variants={fadeUp} className="text-text-muted text-xs mt-4">
            Creado por{' '}
            <a
              href="https://github.com/Tastsumi2551"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Tastsumi
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
