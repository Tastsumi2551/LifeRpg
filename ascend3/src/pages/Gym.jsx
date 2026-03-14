import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import GymSetup from '../components/features/GymSetup';
import PRTracker from '../components/features/PRTracker';
import ProgressPhotos from '../components/features/ProgressPhotos';
import { HiPlay, HiStop, HiPencil } from 'react-icons/hi2';

const restTimers = [30, 60, 90, 120, 180];

export default function Gym() {
  const { settings, addXP, addCoins } = useGameStore();
  const { user } = useAuthStore();
  const [routine, setRoutine] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [training, setTraining] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState([]);
  const [restTimer, setRestTimer] = useState(null);
  const [restDuration, setRestDuration] = useState(90);
  const [restRemaining, setRestRemaining] = useState(0);
  const [showPR, setShowPR] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const goesToGym = settings?.modules?.gym || settings?.healthGoals?.goesToGym;

  useEffect(() => {
    if (user && goesToGym) loadRoutine();
  }, [user, goesToGym]);

  const loadRoutine = async () => {
    if (!user) return;
    const routineDoc = await getDoc(doc(db, 'users', user.uid, 'gym', 'routine'));
    if (routineDoc.exists()) setRoutine(routineDoc.data());

    // Load history
    const historyDoc = await getDoc(doc(db, 'users', user.uid, 'gym', 'history'));
    if (historyDoc.exists()) setHistory(historyDoc.data().sessions || []);
  };

  const saveRoutine = async (data) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'gym', 'routine'), data);
    setRoutine(data);
    setShowSetup(false);
  };

  // Rest timer
  useEffect(() => {
    if (restTimer === null) return;
    if (restRemaining <= 0) {
      setRestTimer(null);
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch {}
      return;
    }
    const interval = setInterval(() => setRestRemaining((r) => r - 1), 1000);
    return () => clearInterval(interval);
  }, [restTimer, restRemaining]);

  const startRest = () => {
    setRestRemaining(restDuration);
    setRestTimer(Date.now());
  };

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[new Date().getDay()];
  const todayRoutine = routine?.days?.find((d) => d.dayOfWeek === todayName);

  const startWorkout = () => {
    if (!todayRoutine) return;
    setTraining(true);
    setCurrentWorkout(
      todayRoutine.exercises.map((ex) => ({
        ...ex,
        sets: Array.from({ length: ex.defaultSets }, () => ({
          weight: ex.currentWeight || 0,
          reps: ex.defaultReps,
          completed: false,
        })),
      }))
    );
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    setCurrentWorkout((prev) => {
      const updated = [...prev];
      updated[exIdx] = { ...updated[exIdx], sets: [...updated[exIdx].sets] };
      updated[exIdx].sets[setIdx] = { ...updated[exIdx].sets[setIdx], [field]: value };
      return updated;
    });
  };

  const completeSet = (exIdx, setIdx) => {
    setCurrentWorkout((prev) => {
      const updated = [...prev];
      updated[exIdx] = { ...updated[exIdx], sets: [...updated[exIdx].sets] };
      updated[exIdx].sets[setIdx] = { ...updated[exIdx].sets[setIdx], completed: true };
      return updated;
    });
  };

  const finishWorkout = async () => {
    if (!user) return;

    // Check PRs
    let prCount = 0;
    const prs = {};
    const prDoc = await getDoc(doc(db, 'users', user.uid, 'gym', 'prs'));
    const existingPRs = prDoc.exists() ? prDoc.data() : {};

    currentWorkout.forEach((ex) => {
      const maxWeight = Math.max(...ex.sets.filter((s) => s.completed).map((s) => s.weight));
      const prevPR = existingPRs[ex.name]?.weight || 0;
      if (maxWeight > prevPR && maxWeight > 0) {
        prs[ex.name] = { weight: maxWeight, date: new Date().toISOString(), reps: ex.sets.find((s) => s.weight === maxWeight)?.reps };
        prCount++;
      }
    });

    if (Object.keys(prs).length > 0) {
      await setDoc(doc(db, 'users', user.uid, 'gym', 'prs'), { ...existingPRs, ...prs }, { merge: true });
    }

    // Calculate volume
    const totalVolume = currentWorkout.reduce((sum, ex) =>
      sum + ex.sets.filter((s) => s.completed).reduce((s, set) => s + set.weight * set.reps, 0), 0
    );

    const xp = 50 + prCount * 20 + Math.floor(totalVolume / 500);
    addXP(Math.min(xp, 150));
    addCoins(Math.floor(xp / 10));

    // Save to history
    const session = {
      date: format(new Date(), 'yyyy-MM-dd'),
      dayName: todayRoutine?.name || todayName,
      exercises: currentWorkout.map((ex) => ({
        name: ex.name,
        sets: ex.sets.filter((s) => s.completed),
      })),
      totalVolume,
      prsHit: prCount,
    };

    const updatedHistory = [session, ...history].slice(0, 90);
    await setDoc(doc(db, 'users', user.uid, 'gym', 'history'), { sessions: updatedHistory });
    setHistory(updatedHistory);

    setTraining(false);
    setCurrentWorkout([]);
  };

  if (!goesToGym) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-5xl mb-4">💪</span>
        <p className="text-text-secondary text-sm">Activa el gym desde tu perfil para desbloquear este módulo</p>
      </div>
    );
  }

  if (showSetup || !routine) {
    return (
      <div className="p-4">
        <GymSetup
          initial={routine}
          units={settings?.units || 'kg'}
          onSave={saveRoutine}
          onCancel={() => routine && setShowSetup(false)}
        />
      </div>
    );
  }

  if (showPR) {
    return (
      <div className="p-4">
        <button onClick={() => setShowPR(false)} className="text-sm text-text-muted mb-4">← Volver</button>
        <PRTracker />
      </div>
    );
  }

  return (
    <div className="p-4 pb-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-text-primary">Gym</h1>
          <p className="text-xs text-text-muted">
            {todayRoutine ? `Hoy: ${todayRoutine.name}` : 'Descanso hoy'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPR(true)} className="text-xs text-cyan hover:text-cyan/80 transition-colors">
            🏆 PRs
          </button>
          <button onClick={() => setShowSetup(true)} className="text-xs text-accent hover:text-accent2 transition-colors">
            <HiPencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="flex gap-1.5">
        {dayNames.map((day) => {
          const hasRoutine = routine.days?.some((d) => d.dayOfWeek === day);
          const isToday = day === todayName;
          const trained = history.some((h) => h.date === format(new Date(), 'yyyy-MM-dd') && isToday);
          return (
            <div
              key={day}
              className={`flex-1 py-2 rounded-lg text-center text-xs font-medium transition-all ${
                isToday
                  ? 'bg-accent text-white'
                  : hasRoutine
                  ? 'bg-green/10 text-green'
                  : 'bg-bg-surface text-text-muted'
              }`}
            >
              {day.substring(0, 2)}
            </div>
          );
        })}
      </div>

      {/* Training */}
      {training ? (
        <div className="flex flex-col gap-3">
          {/* Rest Timer */}
          {restTimer !== null && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-4 text-center"
            >
              <p className="text-xs text-text-muted mb-1">Descanso</p>
              <p className="text-3xl font-mono font-bold text-accent">
                {Math.floor(restRemaining / 60)}:{String(restRemaining % 60).padStart(2, '0')}
              </p>
            </motion.div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {restTimers.map((t) => (
              <button
                key={t}
                onClick={() => { setRestDuration(t); setRestRemaining(t); setRestTimer(Date.now()); }}
                className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs ${
                  restDuration === t ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>

          {/* Exercises */}
          {currentWorkout.map((ex, exIdx) => (
            <div key={exIdx} className="glass-card p-3">
              <h4 className="text-sm font-medium text-text-primary mb-2">{ex.name}</h4>
              <div className="flex flex-col gap-1.5">
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className={`flex items-center gap-2 ${set.completed ? 'opacity-50' : ''}`}>
                    <span className="text-[10px] text-text-muted w-4">S{setIdx + 1}</span>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-16 text-xs text-center"
                      placeholder={settings?.units || 'kg'}
                      disabled={set.completed}
                    />
                    <span className="text-[10px] text-text-muted">×</span>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                      className="w-12 text-xs text-center"
                      disabled={set.completed}
                    />
                    <button
                      onClick={() => { completeSet(exIdx, setIdx); startRest(); }}
                      disabled={set.completed}
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${
                        set.completed ? 'bg-green text-white' : 'border border-accent/30 text-accent hover:bg-accent/10'
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={finishWorkout} className="btn-primary flex items-center justify-center gap-2">
            <HiStop className="w-4 h-4" /> Terminar entrenamiento
          </button>
        </div>
      ) : todayRoutine ? (
        <div className="flex flex-col gap-3">
          {/* Today's exercises preview */}
          <div className="glass-card p-3">
            <h3 className="text-sm font-medium text-text-primary mb-2">{todayRoutine.name}</h3>
            {todayRoutine.exercises.map((ex, i) => (
              <div key={i} className="flex items-center justify-between py-1 text-xs">
                <span className="text-text-secondary">{ex.name}</span>
                <span className="text-text-muted font-mono">{ex.defaultSets}×{ex.defaultReps}</span>
              </div>
            ))}
          </div>
          <button onClick={startWorkout} className="btn-primary flex items-center justify-center gap-2">
            <HiPlay className="w-4 h-4" /> Empezar entrenamiento
          </button>
        </div>
      ) : (
        <div className="glass-card p-6 text-center">
          <span className="text-3xl mb-2 block">🧘</span>
          <p className="text-text-secondary text-sm">Día de descanso</p>
        </div>
      )}

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {showHistory ? '▼' : '▶'} Historial ({history.length})
        </button>
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-2 mt-2 overflow-hidden"
            >
              {history.slice(0, 20).map((session, i) => (
                <div key={i} className="bg-bg-surface rounded-lg p-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{session.dayName}</span>
                    <span className="text-text-muted font-mono">{session.date}</span>
                  </div>
                  <span className="text-text-muted">
                    {session.exercises.length} ejercicios · Vol: {session.totalVolume?.toLocaleString()}
                    {session.prsHit > 0 && <span className="text-gold ml-1">🏆 {session.prsHit} PR</span>}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Photos */}
      <ProgressPhotos />
    </div>
  );
}
