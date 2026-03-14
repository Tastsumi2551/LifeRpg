import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import MissionCard from '../components/features/MissionCard';
import { HiPlus, HiPencil } from 'react-icons/hi2';

const missionTemplates = {
  gym: { name: 'Ir al gym', icon: '🏋️', category: 'gym', xp: 50, difficulty: 'media' },
  study: { name: 'Sesión de estudio completa', icon: '📚', category: 'estudio', xp: 40, difficulty: 'media' },
  water: { name: 'Completar meta de agua', icon: '💧', category: 'hidratación', xp: 15, difficulty: 'fácil' },
  nutrition: { name: 'Comer dentro de macros', icon: '🍽️', category: 'nutrición', xp: 25, difficulty: 'media' },
  pomodoro: { name: 'Completar un pomodoro', icon: '⏱️', category: 'personal', xp: 20, difficulty: 'fácil' },
  walk: { name: 'Caminar 30 minutos', icon: '🚶', category: 'personal', xp: 20, difficulty: 'fácil' },
  read: { name: 'Leer 20 páginas', icon: '📖', category: 'personal', xp: 25, difficulty: 'media' },
  meditate: { name: 'Meditar 10 minutos', icon: '🧘', category: 'personal', xp: 15, difficulty: 'fácil' },
  save: { name: 'Ahorrar hoy', icon: '💰', category: 'finanzas', xp: 20, difficulty: 'fácil' },
  sleep: { name: 'Dormir a tiempo', icon: '😴', category: 'personal', xp: 30, difficulty: 'media' },
  work: { name: 'Sesión productiva de trabajo', icon: '💼', category: 'trabajo', xp: 35, difficulty: 'media' },
};

export default function Missions() {
  const { user } = useAuthStore();
  const { missions, setMissions, schedule, settings, addXP, addCoins } = useGameStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newMission, setNewMission] = useState({ name: '', description: '', xp: 25, category: 'personal', recurrence: 'diaria' });
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[new Date().getDay()];
  const todaySchedule = schedule?.[todayName];

  const generateMissions = useCallback(async () => {
    if (!user) return;
    const missionDocRef = doc(db, 'users', user.uid, 'missions', today);
    const existing = await getDoc(missionDocRef);

    if (existing.exists() && existing.data().missions?.length > 0) {
      setMissions(existing.data().missions);
      return;
    }

    const generated = [];
    const activeMissions = settings?.activeMissions || [];
    const todayBlocks = todaySchedule?.blocks || [];
    const isActiveDay = todaySchedule?.active !== false;

    if (isActiveDay) {
      const hasGymBlock = todayBlocks.some((b) => b.category === 'gym');
      if (hasGymBlock && activeMissions.includes('gym')) {
        const gymBlock = todayBlocks.find((b) => b.category === 'gym');
        generated.push({
          ...missionTemplates.gym,
          id: `auto-gym-${today}`,
          suggestedTime: gymBlock?.start,
          completed: false,
          auto: true,
        });
      }

      const hasStudyBlock = todayBlocks.some((b) => b.category === 'estudio');
      if (hasStudyBlock && activeMissions.includes('study')) {
        const studyBlock = todayBlocks.find((b) => b.category === 'estudio');
        generated.push({
          ...missionTemplates.study,
          id: `auto-study-${today}`,
          suggestedTime: studyBlock?.start,
          completed: false,
          auto: true,
        });
      }

      const hasWorkBlock = todayBlocks.some((b) => b.category === 'trabajo');
      if (hasWorkBlock) {
        const workBlock = todayBlocks.find((b) => b.category === 'trabajo');
        generated.push({
          ...missionTemplates.work,
          id: `auto-work-${today}`,
          suggestedTime: workBlock?.start,
          completed: false,
          auto: true,
        });
      }
    }

    ['water', 'nutrition', 'pomodoro', 'walk', 'read', 'meditate', 'save', 'sleep'].forEach((id) => {
      if (activeMissions.includes(id)) {
        const template = missionTemplates[id];
        if (id === 'sleep') {
          template.name = `Dormir antes de las ${todaySchedule?.sleep || '23:00'}`;
        }
        if (id === 'water') {
          template.name = `Tomar ${settings?.healthGoals?.waterGoal || 8} vasos de agua`;
        }
        generated.push({
          ...template,
          id: `auto-${id}-${today}`,
          completed: false,
          auto: true,
        });
      }
    });

    // Custom missions
    (settings?.customMissions || []).forEach((cm, i) => {
      generated.push({
        id: `custom-${i}-${today}`,
        name: cm.name,
        icon: '⚡',
        category: 'personal',
        xp: cm.xp || 25,
        difficulty: 'media',
        completed: false,
        auto: false,
        custom: true,
      });
    });

    // Fewer missions on rest days
    if (!isActiveDay) {
      const relaxMissions = generated.filter(
        (m) => ['water', 'meditate', 'read', 'walk'].some((id) => m.id.includes(id))
      );
      setMissions(relaxMissions.length > 0 ? relaxMissions : generated.slice(0, 3));
    } else {
      setMissions(generated);
    }

    await setDoc(missionDocRef, { missions: generated, date: today, generatedAt: new Date().toISOString() });
  }, [user, today, todaySchedule, settings, setMissions]);

  useEffect(() => {
    generateMissions();
  }, [generateMissions]);

  const completeMission = async (missionId) => {
    const updated = missions.map((m) =>
      m.id === missionId ? { ...m, completed: true, completedAt: new Date().toISOString() } : m
    );
    setMissions(updated);

    const mission = missions.find((m) => m.id === missionId);
    if (mission) {
      addXP(mission.xp);
      addCoins(Math.floor(mission.xp / 10));
    }

    // Check if all completed for bonus
    const allCompleted = updated.every((m) => m.completed);
    if (allCompleted && updated.length > 0) {
      addXP(50);
      addCoins(5);
    }

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'missions', today), {
        missions: updated,
        date: today,
        generatedAt: new Date().toISOString(),
      });
    }
  };

  const createMission = async () => {
    if (!newMission.name.trim()) return;
    const created = {
      id: `manual-${Date.now()}`,
      name: newMission.name,
      description: newMission.description,
      icon: '⚡',
      category: newMission.category,
      xp: newMission.xp,
      difficulty: newMission.xp > 50 ? 'difícil' : newMission.xp > 25 ? 'media' : 'fácil',
      completed: false,
      auto: false,
    };
    const updated = [...missions, created];
    setMissions(updated);
    setShowCreate(false);
    setNewMission({ name: '', description: '', xp: 25, category: 'personal', recurrence: 'diaria' });

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'missions', today), { missions: updated, date: today });
    }
  };

  const activeMissions = missions.filter((m) => !m.completed);
  const completedMissions = missions.filter((m) => m.completed);

  return (
    <div className="p-4 pb-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-text-primary">Misiones</h1>
          <p className="text-xs text-text-muted">
            {completedMissions.length}/{missions.length} completadas
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
          <HiPlus className="w-3 h-3" /> Nueva
        </button>
      </div>

      {/* Today's Schedule Mini */}
      {todaySchedule?.active && todaySchedule?.blocks?.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {todaySchedule.blocks
            .sort((a, b) => a.start.localeCompare(b.start))
            .map((block, i) => (
              <div key={i} className="flex-shrink-0 bg-bg-surface rounded-lg px-2 py-1 text-[10px]">
                <span className="text-text-muted">{block.start}</span>
                <span className="text-text-secondary ml-1">{block.name}</span>
              </div>
            ))}
        </div>
      )}

      {/* Active Missions */}
      {activeMissions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs text-text-muted font-medium">Misiones del día</h3>
          {activeMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} onComplete={completeMission} />
          ))}
        </div>
      ) : (
        missions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 text-center"
          >
            <span className="text-4xl mb-2 block">🎉</span>
            <p className="text-accent font-medium">¡Todas las misiones completadas!</p>
            <p className="text-text-muted text-xs mt-1">+50 XP bonus</p>
          </motion.div>
        )
      )}

      {/* Completed */}
      {completedMissions.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {showCompleted ? '▼' : '▶'} Completadas ({completedMissions.length})
          </button>
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-2 mt-2 overflow-hidden"
              >
                {completedMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} completed />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {missions.length === 0 && (
        <div className="glass-card p-6 text-center">
          <span className="text-4xl mb-2 block">⚔️</span>
          <p className="text-text-secondary text-sm">Aún no tienes misiones</p>
          <p className="text-text-muted text-xs mt-1">¿Configuraste tu horario?</p>
        </div>
      )}

      {/* Create Mission Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-5 w-full max-w-md flex flex-col gap-4"
            >
              <h3 className="font-display text-lg font-bold">Nueva Misión</h3>
              <input
                type="text"
                value={newMission.name}
                onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
                placeholder="Nombre de la misión"
              />
              <input
                type="text"
                value={newMission.description}
                onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                placeholder="Descripción (opcional)"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">XP (25-100)</label>
                  <input
                    type="number"
                    min="25"
                    max="100"
                    value={newMission.xp}
                    onChange={(e) => setNewMission({ ...newMission, xp: Math.min(100, Math.max(25, parseInt(e.target.value) || 25)) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Categoría</label>
                  <select
                    value={newMission.category}
                    onChange={(e) => setNewMission({ ...newMission, category: e.target.value })}
                  >
                    <option value="personal">🧠 Personal</option>
                    <option value="estudio">📚 Estudio</option>
                    <option value="gym">🏋️ Gym</option>
                    <option value="nutrición">🍽️ Nutrición</option>
                    <option value="finanzas">💰 Finanzas</option>
                    <option value="trabajo">💼 Trabajo</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl text-sm text-text-muted hover:text-text-primary transition-colors">
                  Cancelar
                </button>
                <button onClick={createMission} className="flex-1 btn-primary text-sm py-2">
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
