import { create } from 'zustand';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const XP_PER_LEVEL = (level) => level * 100;

const DEFAULT_SKILLS = {
  economico: { name: 'Económico', icon: '💰', level: 1, xp: 0, color: '#4ecca3' },
  salud: { name: 'Salud', icon: '❤️', level: 1, xp: 0, color: '#e94560' },
  mentalidad: { name: 'Mentalidad', icon: '🧠', level: 1, xp: 0, color: '#a78bfa' },
  estudios: { name: 'Estudios', icon: '📚', level: 1, xp: 0, color: '#60a5fa' },
  alimentacion: { name: 'Alimentación', icon: '🍎', level: 1, xp: 0, color: '#34d399' },
  aprendizaje: { name: 'Aprendizaje', icon: '🎓', level: 1, xp: 0, color: '#fbbf24' },
  carisma: { name: 'Carisma', icon: '✨', level: 1, xp: 0, color: '#f472b6' },
};

const XP_REWARDS = { easy: 10, medium: 25, hard: 50 };

const ACHIEVEMENTS = [
  { id: 'first_mission', name: 'Primera Misión', icon: '🎯', check: (d) => d.missionsCompleted >= 1 },
  { id: 'missions_10', name: '10 Misiones', icon: '💪', check: (d) => d.missionsCompleted >= 10 },
  { id: 'missions_50', name: 'Héroe', icon: '🦸', check: (d) => d.missionsCompleted >= 50 },
  { id: 'streak_7', name: 'Semana Épica', icon: '🔥', check: (d) => d.streak >= 7 },
  { id: 'streak_30', name: 'Mes Imparable', icon: '⚡', check: (d) => d.streak >= 30 },
  { id: 'level_5', name: 'Nivel 5', icon: '⭐', check: (d) => d.playerLevel >= 5 },
  { id: 'level_10', name: 'Maestro', icon: '👑', check: (d) => d.playerLevel >= 10 },
  { id: 'clean_7', name: 'Semana Limpia', icon: '🛡️', check: (d) => d.maxCleanDays >= 7 },
  { id: 'clean_30', name: 'Mes Limpio', icon: '💎', check: (d) => d.maxCleanDays >= 30 },
  { id: 'all_skills_3', name: 'Polímata', icon: '🌟', check: (d) => d.minSkillLevel >= 3 },
];

let syncTimeout = null;

export { XP_REWARDS, ACHIEVEMENTS, DEFAULT_SKILLS };

export const useGameStore = create((set, get) => ({
  // Player data
  displayName: '',
  avatar: '🧑‍💻',
  totalXP: 0,
  missionsCompleted: 0,
  streak: 0,
  lastActiveDate: null,
  lastDailyReset: null,

  // Game systems
  skills: JSON.parse(JSON.stringify(DEFAULT_SKILLS)),
  missions: [],
  badHabits: [],
  unlockedAchievements: [],
  schedule: {},

  loaded: false,
  _uid: null,

  // Computed
  getPlayerLevel: () => {
    const skills = get().skills;
    const avg = Object.values(skills).reduce((sum, s) => sum + s.level, 0) / 7;
    return Math.max(1, Math.floor(avg));
  },

  // Actions
  addSkillXP: (skillKey, amount) => {
    const state = get();
    const skills = { ...state.skills };
    const skill = { ...skills[skillKey] };

    skill.xp += amount;
    while (skill.xp >= XP_PER_LEVEL(skill.level)) {
      skill.xp -= XP_PER_LEVEL(skill.level);
      skill.level++;
    }

    skills[skillKey] = skill;
    set({
      skills,
      totalXP: state.totalXP + amount,
    });
    get().checkAchievements();
    get().debouncedSync();
  },

  removeSkillXP: (skillKey, amount) => {
    const state = get();
    const skills = { ...state.skills };
    const skill = { ...skills[skillKey] };
    skill.xp = Math.max(0, skill.xp - amount);
    skills[skillKey] = skill;
    set({
      skills,
      totalXP: Math.max(0, state.totalXP - amount),
    });
    get().debouncedSync();
  },

  completeMission: (index) => {
    const state = get();
    const missions = [...state.missions];
    const mission = { ...missions[index] };

    if (mission.completed) return;

    mission.completed = true;
    missions[index] = mission;

    set({
      missions,
      missionsCompleted: state.missionsCompleted + 1,
      streak: state.streak + 1,
      lastActiveDate: new Date().toDateString(),
    });

    get().addSkillXP(mission.skill, mission.xpReward);
  },

  uncompleteMission: (index) => {
    const state = get();
    const missions = [...state.missions];
    missions[index] = { ...missions[index], completed: false };
    set({ missions });
    get().debouncedSync();
  },

  addMission: (mission) => {
    const state = get();
    set({
      missions: [...state.missions, {
        ...mission,
        xpReward: XP_REWARDS[mission.difficulty],
        completed: false,
        createdAt: Date.now(),
      }],
    });
    get().debouncedSync();
  },

  deleteMission: (index) => {
    const state = get();
    const missions = [...state.missions];
    missions.splice(index, 1);
    set({ missions });
    get().debouncedSync();
  },

  resetDailyMissions: () => {
    const state = get();
    const today = new Date().toDateString();
    if (state.lastDailyReset === today) return;

    const missions = state.missions.map((m) =>
      m.isDaily ? { ...m, completed: false } : m
    );
    set({ missions, lastDailyReset: today });
    get().debouncedSync();
  },

  // Bad habits
  addBadHabit: (habit) => {
    const state = get();
    set({
      badHabits: [...state.badHabits, {
        ...habit,
        cleanDays: 0,
        createdAt: Date.now(),
      }],
    });
    get().debouncedSync();
  },

  reportRelapse: (index) => {
    const state = get();
    const badHabits = [...state.badHabits];
    const habit = { ...badHabits[index] };

    get().removeSkillXP(habit.affectedSkill, habit.penalty);

    habit.cleanDays = 0;
    badHabits[index] = habit;
    set({ badHabits });
    get().debouncedSync();
  },

  incrementCleanDays: () => {
    const state = get();
    const today = new Date().toDateString();
    if (state._lastCleanIncrement === today) return;

    const badHabits = state.badHabits.map((h) => ({
      ...h,
      cleanDays: h.cleanDays + 1,
    }));
    set({ badHabits, _lastCleanIncrement: today });
    get().checkAchievements();
    get().debouncedSync();
  },

  deleteBadHabit: (index) => {
    const state = get();
    const badHabits = [...state.badHabits];
    badHabits.splice(index, 1);
    set({ badHabits });
    get().debouncedSync();
  },

  // Schedule
  updateSchedule: (newSchedule) => {
    set({ schedule: newSchedule });
    const uid = get()._uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'schedule', 'data'), newSchedule, { merge: true });
    }
  },

  // Achievements
  checkAchievements: () => {
    const state = get();
    const data = {
      missionsCompleted: state.missionsCompleted,
      streak: state.streak,
      playerLevel: state.getPlayerLevel(),
      maxCleanDays: state.badHabits.reduce((max, h) => Math.max(max, h.cleanDays), 0),
      minSkillLevel: Math.min(...Object.values(state.skills).map((s) => s.level)),
    };

    const newUnlocked = [...state.unlockedAchievements];
    let changed = false;

    ACHIEVEMENTS.forEach((a) => {
      if (!newUnlocked.includes(a.id) && a.check(data)) {
        newUnlocked.push(a.id);
        changed = true;
      }
    });

    if (changed) {
      set({ unlockedAchievements: newUnlocked });
      get().debouncedSync();
    }
  },

  // Profile
  setDisplayName: (name) => {
    set({ displayName: name });
    get().debouncedSync();
  },

  setAvatar: (avatar) => {
    set({ avatar });
    get().debouncedSync();
  },

  // Firebase sync
  syncToFirebase: async () => {
    const state = get();
    const uid = state._uid;
    if (!uid) return;

    try {
      await setDoc(doc(db, 'users', uid, 'profile', 'data'), {
        displayName: state.displayName,
        avatar: state.avatar,
        totalXP: state.totalXP,
        missionsCompleted: state.missionsCompleted,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        lastDailyReset: state.lastDailyReset,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await setDoc(doc(db, 'users', uid, 'game', 'data'), {
        skills: state.skills,
        missions: state.missions,
        badHabits: state.badHabits,
        unlockedAchievements: state.unlockedAchievements,
      }, { merge: true });

      await setDoc(doc(db, 'users', uid, 'schedule', 'data'), state.schedule || {}, { merge: true });
    } catch (err) {
      console.error('Sync failed:', err);
    }
  },

  debouncedSync: () => {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => get().syncToFirebase(), 2000);
  },

  loadFromFirebase: async (uid) => {
    set({ _uid: uid });
    try {
      const profileDoc = await getDoc(doc(db, 'users', uid, 'profile', 'data'));
      if (profileDoc.exists()) {
        const d = profileDoc.data();
        set({
          displayName: d.displayName || '',
          avatar: d.avatar || '🧑‍💻',
          totalXP: d.totalXP || 0,
          missionsCompleted: d.missionsCompleted || 0,
          streak: d.streak || 0,
          lastActiveDate: d.lastActiveDate || null,
          lastDailyReset: d.lastDailyReset || null,
        });
      }

      const gameDoc = await getDoc(doc(db, 'users', uid, 'game', 'data'));
      if (gameDoc.exists()) {
        const d = gameDoc.data();
        const loadedSkills = d.skills || {};
        // Merge with defaults to ensure all skills exist
        const mergedSkills = { ...JSON.parse(JSON.stringify(DEFAULT_SKILLS)) };
        Object.keys(loadedSkills).forEach((key) => {
          if (mergedSkills[key]) {
            mergedSkills[key] = { ...mergedSkills[key], ...loadedSkills[key] };
          }
        });
        set({
          skills: mergedSkills,
          missions: d.missions || [],
          badHabits: d.badHabits || [],
          unlockedAchievements: d.unlockedAchievements || [],
        });
      }

      const scheduleDoc = await getDoc(doc(db, 'users', uid, 'schedule', 'data'));
      if (scheduleDoc.exists()) {
        set({ schedule: scheduleDoc.data() });
      }

      // Auto reset daily missions
      get().resetDailyMissions();
      // Auto increment clean days
      get().incrementCleanDays();

      set({ loaded: true });
    } catch (err) {
      console.error('Load failed:', err);
      set({ loaded: true });
    }
  },
}));
