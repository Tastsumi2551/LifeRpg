import { create } from 'zustand';
import { doc, setDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const XP_PER_LEVEL = (level) => level * 100;

let syncTimeout = null;

export const useGameStore = create((set, get) => ({
  profile: {
    displayName: '',
    avatar: '🧑‍💻',
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 0,
    streak: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: null,
  },
  missions: [],
  schedule: {},
  stats: {
    missionsCompleted: 0,
    totalXpEarned: 0,
    maxStreak: 0,
    daysActive: 0,
  },
  settings: {
    theme: 'dark',
    notifications: true,
    sounds: true,
    language: 'es',
    healthGoals: {},
    activeMissions: [],
    units: 'kg',
    modules: { gym: false, finance: false, academic: false },
  },
  loaded: false,

  addXP: (amount) => {
    const state = get();
    let { xp, level, totalXp } = state.profile;
    xp += amount;
    totalXp += amount;

    while (xp >= XP_PER_LEVEL(level) && level < 100) {
      xp -= XP_PER_LEVEL(level);
      level++;
    }

    set({
      profile: { ...state.profile, xp, level, totalXp },
      stats: { ...state.stats, totalXpEarned: state.stats.totalXpEarned + amount },
    });
    get().debouncedSync();
  },

  addCoins: (amount) => {
    const state = get();
    set({ profile: { ...state.profile, coins: state.profile.coins + amount } });
    get().debouncedSync();
  },

  spendCoins: (amount) => {
    const state = get();
    if (state.profile.coins < amount) return false;
    set({ profile: { ...state.profile, coins: state.profile.coins - amount } });
    get().debouncedSync();
    return true;
  },

  updateStreak: () => {
    const state = get();
    const streak = state.profile.streak + 1;
    const maxStreak = Math.max(streak, state.stats.maxStreak);
    set({
      profile: { ...state.profile, streak },
      stats: { ...state.stats, maxStreak },
    });
    get().debouncedSync();
  },

  setProfile: (data) => {
    set((state) => ({ profile: { ...state.profile, ...data } }));
  },

  setSchedule: (schedule) => set({ schedule }),
  setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  setMissions: (missions) => set({ missions }),
  setStats: (stats) => set((state) => ({ stats: { ...state.stats, ...stats } })),

  syncToFirebase: async () => {
    const state = get();
    const uid = state._uid;
    if (!uid) return;

    try {
      await setDoc(doc(db, 'users', uid, 'profile', 'data'), {
        ...state.profile,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await setDoc(doc(db, 'users', uid, 'settings', 'data'), state.settings, { merge: true });
      await setDoc(doc(db, 'users', uid, 'stats', 'data'), state.stats, { merge: true });
    } catch (err) {
      console.error('Sync to Firebase failed:', err);
    }
  },

  debouncedSync: () => {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      get().syncToFirebase();
    }, 2000);
  },

  loadFromFirebase: async (uid) => {
    set({ _uid: uid });
    try {
      const profileDoc = await getDoc(doc(db, 'users', uid, 'profile', 'data'));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        set((state) => ({
          profile: {
            ...state.profile,
            displayName: data.displayName || '',
            avatar: data.avatar || '🧑‍💻',
            level: data.level || 1,
            xp: data.xp || 0,
            totalXp: data.totalXp || 0,
            coins: data.coins || 0,
            streak: data.streak || 0,
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            createdAt: data.createdAt || null,
          },
        }));
      }

      const scheduleDoc = await getDoc(doc(db, 'users', uid, 'schedule', 'data'));
      if (scheduleDoc.exists()) {
        set({ schedule: scheduleDoc.data() });
      }

      const settingsDoc = await getDoc(doc(db, 'users', uid, 'settings', 'data'));
      if (settingsDoc.exists()) {
        set((state) => ({ settings: { ...state.settings, ...settingsDoc.data() } }));
      }

      const statsDoc = await getDoc(doc(db, 'users', uid, 'stats', 'data'));
      if (statsDoc.exists()) {
        set((state) => ({ stats: { ...state.stats, ...statsDoc.data() } }));
      }

      set({ loaded: true });
    } catch (err) {
      console.error('Load from Firebase failed:', err);
      set({ loaded: true });
    }
  },

  updateSchedule: (newSchedule) => {
    set({ schedule: newSchedule });
    const uid = get()._uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'schedule', 'data'), newSchedule, { merge: true });
    }
  },

  updateSettings: (newSettings) => {
    set((state) => ({ settings: { ...state.settings, ...newSettings } }));
    get().debouncedSync();
  },

  _uid: null,
}));
