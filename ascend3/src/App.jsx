import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import { useAuthStore } from './stores/authStore';
import AuthGuard from './components/layout/AuthGuard';
import Login from './pages/Login';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Missions from './pages/Missions';
import Gym from './pages/Gym';
import Nutrition from './pages/Nutrition';
import Shop from './pages/Shop';
import Profile from './pages/Profile';

export default function App() {
  useAuth();

  return (
    <div className="noise-bg h-full">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={
            <AuthGuard requireAuth requireOnboarding={false}>
              <OnboardingWizard />
            </AuthGuard>
          } />
          <Route path="/" element={
            <AuthGuard requireAuth requireOnboarding>
              <MainLayout />
            </AuthGuard>
          }>
            <Route index element={<Home />} />
            <Route path="missions" element={<Missions />} />
            <Route path="gym" element={<Gym />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="shop" element={<Shop />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
