import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Missions from './pages/Missions';
import Schedule from './pages/Schedule';
import Battle from './pages/Battle';
import Profile from './pages/Profile';

export default function App() {
  useAuth();
  const { user, loading, error } = useAuthStore();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="loading-screen">
        <p style={{ color: 'var(--accent)', fontSize: '2rem' }}>⚠️</p>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, textAlign: 'center' }}>{error}</p>
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
          <Route path="/battle" element={<Battle />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
