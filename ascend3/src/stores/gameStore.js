import { create } from 'zustand';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ══════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════

const XP_PER_LEVEL = (level) => level * 100;

const XP_REWARDS = { easy: 10, medium: 25, hard: 50 };
const COIN_REWARDS = { easy: 5, medium: 15, hard: 30 };
const POMODORO_XP = { 25: 15, 45: 30, 60: 45 };

const DEFAULT_SKILLS = {
  economico: { name: 'Económico', icon: '💰', level: 1, xp: 0, color: '#4ecca3' },
  salud: { name: 'Salud', icon: '❤️', level: 1, xp: 0, color: '#e94560' },
  mentalidad: { name: 'Mentalidad', icon: '🧠', level: 1, xp: 0, color: '#a78bfa' },
  estudios: { name: 'Estudios', icon: '📚', level: 1, xp: 0, color: '#60a5fa' },
  alimentacion: { name: 'Alimentación', icon: '🍎', level: 1, xp: 0, color: '#34d399' },
  aprendizaje: { name: 'Aprendizaje', icon: '🎓', level: 1, xp: 0, color: '#fbbf24' },
  carisma: { name: 'Carisma', icon: '✨', level: 1, xp: 0, color: '#f472b6' },
};

const ACHIEVEMENTS = [
  { id: 'first_mission', name: 'Primera Misión', icon: '🎯', desc: 'Completa tu primera misión', check: (d) => d.missionsCompleted >= 1 },
  { id: 'missions_10', name: '10 Misiones', icon: '💪', desc: 'Completa 10 misiones', check: (d) => d.missionsCompleted >= 10 },
  { id: 'missions_50', name: 'Héroe', icon: '🦸', desc: 'Completa 50 misiones', check: (d) => d.missionsCompleted >= 50 },
  { id: 'missions_100', name: 'Leyenda', icon: '🏆', desc: 'Completa 100 misiones', check: (d) => d.missionsCompleted >= 100 },
  { id: 'streak_7', name: 'Semana Épica', icon: '🔥', desc: 'Racha de 7 días', check: (d) => d.streak >= 7 },
  { id: 'streak_30', name: 'Mes Imparable', icon: '⚡', desc: 'Racha de 30 días', check: (d) => d.streak >= 30 },
  { id: 'level_5', name: 'Nivel 5', icon: '⭐', desc: 'Alcanza nivel 5', check: (d) => d.playerLevel >= 5 },
  { id: 'level_10', name: 'Maestro', icon: '👑', desc: 'Alcanza nivel 10', check: (d) => d.playerLevel >= 10 },
  { id: 'clean_7', name: 'Semana Limpia', icon: '🛡️', desc: '7 días sin recaída', check: (d) => d.maxCleanDays >= 7 },
  { id: 'clean_30', name: 'Mes Limpio', icon: '💎', desc: '30 días sin recaída', check: (d) => d.maxCleanDays >= 30 },
  { id: 'all_skills_3', name: 'Polímata', icon: '🌟', desc: 'Todas las skills a Nv.3', check: (d) => d.minSkillLevel >= 3 },
  { id: 'rich', name: 'Rico', icon: '💰', desc: 'Acumula 500 monedas', check: (d) => d.coins >= 500 },
];

const EXPENSE_CATEGORIES = [
  { value: 'comida', label: 'Comida', icon: '🍔' },
  { value: 'transporte', label: 'Transporte', icon: '🚌' },
  { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎮' },
  { value: 'educacion', label: 'Educación', icon: '📚' },
  { value: 'salud', label: 'Salud', icon: '💊' },
  { value: 'compras', label: 'Compras', icon: '🛍️' },
  { value: 'servicios', label: 'Servicios', icon: '📱' },
  { value: 'otro', label: 'Otro', icon: '📌' },
];

const INCOME_CATEGORIES = [
  { value: 'salario', label: 'Salario', icon: '💼' },
  { value: 'freelance', label: 'Freelance', icon: '💻' },
  { value: 'regalo', label: 'Regalo', icon: '🎁' },
  { value: 'otro', label: 'Otro', icon: '📌' },
];

const SKILL_OPTIONS = [
  { value: 'economico', label: '💰 Económico' },
  { value: 'salud', label: '❤️ Salud' },
  { value: 'mentalidad', label: '🧠 Mentalidad' },
  { value: 'estudios', label: '📚 Estudios' },
  { value: 'alimentacion', label: '🍎 Alimentación' },
  { value: 'aprendizaje', label: '🎓 Aprendizaje' },
  { value: 'carisma', label: '✨ Carisma' },
];

const SCHEDULE_CATEGORIES = [
  { value: 'clase', label: 'Clase', color: '#60a5fa', icon: '📚' },
  { value: 'gym', label: 'Gym', color: '#e94560', icon: '💪' },
  { value: 'trabajo', label: 'Trabajo', color: '#4ecca3', icon: '💼' },
  { value: 'estudio', label: 'Estudio', color: '#fbbf24', icon: '📖' },
  { value: 'libre', label: 'Libre', color: '#a78bfa', icon: '🎮' },
  { value: 'comida', label: 'Comida', color: '#34d399', icon: '🍎' },
  { value: 'descanso', label: 'Descanso', color: '#64748b', icon: '😴' },
  { value: 'otro', label: 'Otro', color: '#f472b6', icon: '📌' },
];

export {
  XP_REWARDS, COIN_REWARDS, POMODORO_XP, ACHIEVEMENTS, DEFAULT_SKILLS,
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, SKILL_OPTIONS, SCHEDULE_CATEGORIES,
};

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════

const todayStr = () => new Date().toISOString().split('T')[0];
const todayDateStr = () => new Date().toDateString();

let syncTimeout = null;

// ══════════════════════════════════════════════════════
// STORE
// ══════════════════════════════════════════════════════

export const useGameStore = create((set, get) => ({
  // ── Player ──
  displayName: '',
  avatar: '🧑‍💻',
  totalXP: 0,
  coins: 0,
  missionsCompleted: 0,
  streak: 0,
  lastActiveDate: null,
  lastDailyReset: null,

  // ── Core Systems ──
  skills: JSON.parse(JSON.stringify(DEFAULT_SKILLS)),
  missions: [],
  badHabits: [],
  unlockedAchievements: [],
  schedule: {},

  // ── Shop ──
  shopItems: [],
  purchasedRewards: [],

  // ── Activity Log (for heatmap) ──
  activityLog: {},

  // ── Academic ──
  subjects: [],
  exams: [],

  // ── Finance ──
  transactions: [],
  currency: 'USD',

  // ── Pomodoro ──
  pomodoroSessions: 0,
  pomodoroTotalMinutes: 0,

  // ── Notifications Queue ──
  notifications: [],

  // ── State ──
  loaded: false,
  _uid: null,
  _lastCleanIncrement: null,

  // ══════════════════════════════════════════════════════
  // COMPUTED
  // ══════════════════════════════════════════════════════

  getPlayerLevel: () => {
    const skills = get().skills;
    const avg = Object.values(skills).reduce((sum, s) => sum + s.level, 0) / 7;
    return Math.max(1, Math.floor(avg));
  },

  // ══════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ══════════════════════════════════════════════════════

  pushNotification: (msg) => {
    const id = Date.now();
    set((s) => ({ notifications: [...s.notifications, { id, msg }] }));
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    }, 3500);
  },

  // ══════════════════════════════════════════════════════
  // ACTIVITY LOG
  // ══════════════════════════════════════════════════════

  logActivity: (points = 1) => {
    const today = todayStr();
    const log = { ...get().activityLog };
    log[today] = (log[today] || 0) + points;
    set({ activityLog: log });
  },

  // ══════════════════════════════════════════════════════
  // SKILL XP (with level-up detection)
  // ══════════════════════════════════════════════════════

  addSkillXP: (skillKey, amount) => {
    const state = get();
    const skills = { ...state.skills };
    const skill = { ...skills[skillKey] };
    const prevLevel = skill.level;

    skill.xp += amount;
    while (skill.xp >= XP_PER_LEVEL(skill.level)) {
      skill.xp -= XP_PER_LEVEL(skill.level);
      skill.level++;
    }
    skills[skillKey] = skill;
    set({ skills, totalXP: state.totalXP + amount });

    // Level-up notification
    if (skill.level > prevLevel) {
      get().pushNotification(`${skill.icon} ${skill.name} subió a Nivel ${skill.level}!`);
    }

    get().logActivity(1);
    get().checkAchievements();
    get().debouncedSync();
  },

  removeSkillXP: (skillKey, amount) => {
    const state = get();
    const skills = { ...state.skills };
    const skill = { ...skills[skillKey] };
    skill.xp = Math.max(0, skill.xp - amount);
    skills[skillKey] = skill;
    set({ skills, totalXP: Math.max(0, state.totalXP - amount) });
    get().debouncedSync();
  },

  // ══════════════════════════════════════════════════════
  // STREAK (fixed: once per day)
  // ══════════════════════════════════════════════════════

  updateStreak: () => {
    const state = get();
    const today = todayDateStr();
    if (state.lastActiveDate === today) return; // Already updated today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasActiveYesterday = state.lastActiveDate === yesterday.toDateString();

    set({
      streak: wasActiveYesterday ? state.streak + 1 : 1,
      lastActiveDate: today,
    });
    get().debouncedSync();
  },

  // ══════════════════════════════════════════════════════
  // MISSIONS
  // ══════════════════════════════════════════════════════

  completeMission: (index) => {
    const state = get();
    const missions = [...state.missions];
    const mission = { ...missions[index] };
    if (mission.completed) return;

    mission.completed = true;
    missions[index] = mission;

    const coinReward = COIN_REWARDS[mission.difficulty] || 5;

    set({
      missions,
      missionsCompleted: state.missionsCompleted + 1,
      coins: state.coins + coinReward,
    });

    get().updateStreak();
    get().addSkillXP(mission.skill, mission.xpReward);
    get().pushNotification(`+${mission.xpReward} XP · +${coinReward} monedas`);
  },

  uncompleteMission: (index) => {
    const state = get();
    const missions = [...state.missions];
    missions[index] = { ...missions[index], completed: false };
    set({ missions });
    get().debouncedSync();
  },

  addMission: (mission) => {
    set((s) => ({
      missions: [...s.missions, {
        ...mission,
        xpReward: XP_REWARDS[mission.difficulty],
        completed: false,
        createdAt: Date.now(),
      }],
    }));
    get().debouncedSync();
  },

  deleteMission: (index) => {
    set((s) => {
      const missions = [...s.missions];
      missions.splice(index, 1);
      return { missions };
    });
    get().debouncedSync();
  },

  resetDailyMissions: () => {
    const state = get();
    const today = todayDateStr();
    if (state.lastDailyReset === today) return;
    const missions = state.missions.map((m) =>
      m.isDaily ? { ...m, completed: false } : m
    );
    set({ missions, lastDailyReset: today });
    get().debouncedSync();
  },

  // ══════════════════════════════════════════════════════
  // BAD HABITS
  // ══════════════════════════════════════════════════════

  addBadHabit: (habit) => {
    set((s) => ({
      badHabits: [...s.badHabits, {
        ...habit,
        cleanDays: 0,
        createdAt: Date.now(),
      }],
    }));
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
    const today = todayDateStr();
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
    set((s) => {
      const badHabits = [...s.badHabits];
      badHabits.splice(index, 1);
      return { badHabits };
    });
    get().debouncedSync();
  },

  // ══════════════════════════════════════════════════════
  // POMODORO
  // ══════════════════════════════════════════════════════

  completePomodoroSession: (minutes, skillKey) => {
    const state = get();
    const xp = POMODORO_XP[minutes] || 15;
    const coins = Math.floor(minutes / 5);

    set({
      pomodoroSessions: state.pomodoroSessions + 1,
      pomodoroTotalMinutes: state.pomodoroTotalMinutes + minutes,
      coins: state.coins + coins,
    });

    get().addSkillXP(skillKey, xp);
    get().logActivity(2);
    get().pushNotification(`Pomodoro completado! +${xp} XP · +${coins} monedas`);
  },

  // ══════════════════════════════════════════════════════
  // SHOP
  // ══════════════════════════════════════════════════════

  addShopItem: (item) => {
    set((s) => ({
      shopItems: [...s.shopItems, { ...item, id: Date.now().toString() }],
    }));
    get().debouncedSync();
  },

  deleteShopItem: (id) => {
    set((s) => ({
      shopItems: s.shopItems.filter((i) => i.id !== id),
    }));
    get().debouncedSync();
  },

  purchaseReward: (id) => {
    const state = get();
    const item = state.shopItems.find((i) => i.id === id);
    if (!item || state.coins < item.price) return false;

    set({
      coins: state.coins - item.price,
      purchasedRewards: [...state.purchasedRewards, {
        ...item,
        purchasedAt: Date.now(),
      }],
    });
    get().pushNotification(`Compraste: ${item.name}!`);
    get().debouncedSync();
    return true;
  },

  // ══════════════════════════════════════════════════════
  // SCHEDULE
  // ══════════════════════════════════════════════════════

  updateSchedule: (newSchedule) => {
    set({ schedule: newSchedule });
    const uid = get()._uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'schedule', 'data'), newSchedule, { merge: true });
    }
  },

  // ══════════════════════════════════════════════════════
  // ACADEMIC
  // ══════════════════════════════════════════════════════

  addSubject: (subject) => {
    set((s) => ({
      subjects: [...s.subjects, { ...subject, id: Date.now().toString() }],
    }));
    get().debouncedSync();
  },

  deleteSubject: (id) => {
    set((s) => ({
      subjects: s.subjects.filter((s2) => s2.id !== id),
      exams: s.exams.filter((e) => e.subjectId !== id),
    }));
    get().debouncedSync();
  },

  addExam: (exam) => {
    set((s) => ({
      exams: [...s.exams, { ...exam, id: Date.now().toString() }],
    }));
    get().debouncedSync();
  },

  deleteExam: (id) => {
    set((s) => ({ exams: s.exams.filter((e) => e.id !== id) }));
    get().debouncedSync();
  },

  // ══════════════════════════════════════════════════════
  // FINANCE
  // ══════════════════════════════════════════════════════

  addTransaction: (transaction) => {
    set((s) => ({
      transactions: [...s.transactions, {
        ...transaction,
        id: Date.now().toString(),
        date: transaction.date || todayStr(),
      }],
    }));
    get().debouncedSync();
  },

  deleteTransaction: (id) => {
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
    get().debouncedSync();
  },

  setCurrency: (currency) => {
    set({ currency });
    get().debouncedSync();
  },

  // ══════════════════════════════════════════════════════
  // ACHIEVEMENTS
  // ══════════════════════════════════════════════════════

  checkAchievements: () => {
    const state = get();
    const data = {
      missionsCompleted: state.missionsCompleted,
      streak: state.streak,
      playerLevel: state.getPlayerLevel(),
      maxCleanDays: state.badHabits.reduce((max, h) => Math.max(max, h.cleanDays), 0),
      minSkillLevel: Math.min(...Object.values(state.skills).map((s) => s.level)),
      coins: state.coins,
    };
    const newUnlocked = [...state.unlockedAchievements];
    let changed = false;
    ACHIEVEMENTS.forEach((a) => {
      if (!newUnlocked.includes(a.id) && a.check(data)) {
        newUnlocked.push(a.id);
        changed = true;
        get().pushNotification(`Logro desbloqueado: ${a.icon} ${a.name}`);
      }
    });
    if (changed) {
      set({ unlockedAchievements: newUnlocked });
      get().debouncedSync();
    }
  },

  // ══════════════════════════════════════════════════════
  // PROFILE
  // ══════════════════════════════════════════════════════

  setDisplayName: (name) => { set({ displayName: name }); get().debouncedSync(); },
  setAvatar: (avatar) => { set({ avatar }); get().debouncedSync(); },

  // ══════════════════════════════════════════════════════
  // FIREBASE SYNC
  // ══════════════════════════════════════════════════════

  syncToFirebase: async () => {
    const state = get();
    const uid = state._uid;
    if (!uid) return;
    try {
      await Promise.all([
        setDoc(doc(db, 'users', uid, 'profile', 'data'), {
          displayName: state.displayName,
          avatar: state.avatar,
          totalXP: state.totalXP,
          coins: state.coins,
          missionsCompleted: state.missionsCompleted,
          streak: state.streak,
          lastActiveDate: state.lastActiveDate,
          lastDailyReset: state.lastDailyReset,
          pomodoroSessions: state.pomodoroSessions,
          pomodoroTotalMinutes: state.pomodoroTotalMinutes,
          updatedAt: serverTimestamp(),
        }, { merge: true }),
        setDoc(doc(db, 'users', uid, 'game', 'data'), {
          skills: state.skills,
          missions: state.missions,
          badHabits: state.badHabits,
          unlockedAchievements: state.unlockedAchievements,
          activityLog: state.activityLog,
        }, { merge: true }),
        setDoc(doc(db, 'users', uid, 'shop', 'data'), {
          shopItems: state.shopItems,
          purchasedRewards: state.purchasedRewards,
        }, { merge: true }),
        setDoc(doc(db, 'users', uid, 'academic', 'data'), {
          subjects: state.subjects,
          exams: state.exams,
        }, { merge: true }),
        setDoc(doc(db, 'users', uid, 'finance', 'data'), {
          transactions: state.transactions,
          currency: state.currency,
        }, { merge: true }),
      ]);
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
      const [profileDoc, gameDoc, scheduleDoc, academicDoc, financeDoc, shopDoc] = await Promise.all([
        getDoc(doc(db, 'users', uid, 'profile', 'data')),
        getDoc(doc(db, 'users', uid, 'game', 'data')),
        getDoc(doc(db, 'users', uid, 'schedule', 'data')),
        getDoc(doc(db, 'users', uid, 'academic', 'data')),
        getDoc(doc(db, 'users', uid, 'finance', 'data')),
        getDoc(doc(db, 'users', uid, 'shop', 'data')),
      ]);

      if (profileDoc.exists()) {
        const d = profileDoc.data();
        set({
          displayName: d.displayName || '',
          avatar: d.avatar || '🧑‍💻',
          totalXP: d.totalXP || 0,
          coins: d.coins || 0,
          missionsCompleted: d.missionsCompleted || 0,
          streak: d.streak || 0,
          lastActiveDate: d.lastActiveDate || null,
          lastDailyReset: d.lastDailyReset || null,
          pomodoroSessions: d.pomodoroSessions || 0,
          pomodoroTotalMinutes: d.pomodoroTotalMinutes || 0,
        });
      }

      if (gameDoc.exists()) {
        const d = gameDoc.data();
        const mergedSkills = JSON.parse(JSON.stringify(DEFAULT_SKILLS));
        if (d.skills) {
          Object.keys(d.skills).forEach((key) => {
            if (mergedSkills[key]) {
              mergedSkills[key] = { ...mergedSkills[key], ...d.skills[key] };
            }
          });
        }
        set({
          skills: mergedSkills,
          missions: d.missions || [],
          badHabits: d.badHabits || [],
          unlockedAchievements: d.unlockedAchievements || [],
          activityLog: d.activityLog || {},
        });
      }

      if (scheduleDoc.exists()) {
        set({ schedule: scheduleDoc.data() });
      }

      if (academicDoc.exists()) {
        const d = academicDoc.data();
        set({ subjects: d.subjects || [], exams: d.exams || [] });
      }

      if (financeDoc.exists()) {
        const d = financeDoc.data();
        set({ transactions: d.transactions || [], currency: d.currency || 'USD' });
      }

      if (shopDoc.exists()) {
        const d = shopDoc.data();
        set({
          shopItems: d.shopItems || [],
          purchasedRewards: d.purchasedRewards || [],
        });
      }

      get().resetDailyMissions();
      get().incrementCleanDays();
      set({ loaded: true });
    } catch (err) {
      console.error('Load failed:', err);
      set({ loaded: true });
    }
  },
}));
