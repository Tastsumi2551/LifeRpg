import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Missions from './pages/Missions';
import Schedule from './pages/Schedule';
import Arsenal from './pages/Arsenal';
import Finance from './pages/Finance';
import Profile from './pages/Profile';

export default function App() {
  useAuth();
  const { user, loading, error } = useAuthStore();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cargando...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="loading-screen">
        <div style={{ fontSize: '2.4rem', marginBottom: 4 }}>⚠️</div>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 360, textAlign: 'center', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {error}
        </p>
        <button className="btn-primary" style={{ maxWidth: 200 }} onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route element={user ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/arsenal" element={<Arsenal />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
