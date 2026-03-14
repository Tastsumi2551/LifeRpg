import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,
  onboardingComplete: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
  clearError: () => set({ error: null }),
}));
