import { useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const initialized = useRef(false);
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const timeout = setTimeout(() => {
      setError('No se pudo conectar al servidor. Verifica tu conexión a internet y recarga la página.');
      setLoading(false);
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      setUser(user || null);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [setUser, setLoading, setError]);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  return { loginWithGoogle, loginWithEmail, register, logout };
}
