import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';

export default function HydrationTracker({ compact = false }) {
  const { settings, addXP } = useGameStore();
  const { user } = useAuthStore();
  const [glasses, setGlasses] = useState(0);
  const [completed, setCompleted] = useState(false);

  const goal = settings?.healthGoals?.waterGoal || 8;
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) loadHydration();
  }, [user]);

  const loadHydration = async () => {
    if (!user) return;
    const hydDoc = await getDoc(doc(db, 'users', user.uid, 'nutrition', `hydration-${today}`));
    if (hydDoc.exists()) {
      setGlasses(hydDoc.data().glasses || 0);
      setCompleted(hydDoc.data().completed || false);
    }
  };

  const addGlass = async () => {
    const newCount = glasses + 1;
    setGlasses(newCount);

    if (newCount >= goal && !completed) {
      setCompleted(true);
      addXP(15);
    }

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'nutrition', `hydration-${today}`), {
        glasses: newCount,
        goal,
        completed: newCount >= goal,
        date: today,
      });
    }
  };

  if (compact) {
    return (
      <div className="glass-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💧</span>
          <div>
            <span className="text-sm font-mono font-semibold text-text-primary">{glasses}/{goal}</span>
            <span className="text-xs text-text-muted ml-1">vasos</span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={addGlass}
          className="w-10 h-10 rounded-full bg-cyan/10 text-cyan flex items-center justify-center text-lg hover:bg-cyan/20 transition-colors"
        >
          💧
        </motion.button>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">💧 Hidratación</h3>
        <span className="text-xs text-text-muted font-mono">{glasses}/{goal} vasos</span>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        {Array.from({ length: goal }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ scale: i < glasses ? 1 : 0.85, opacity: i < glasses ? 1 : 0.3 }}
            className="text-xl"
          >
            💧
          </motion.div>
        ))}
      </div>

      <div className="w-full h-2 bg-bg-deep rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-cyan rounded-full"
          animate={{ width: `${Math.min((glasses / goal) * 100, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={addGlass}
        className="w-full py-2 rounded-xl bg-cyan/10 text-cyan font-medium text-sm hover:bg-cyan/20 transition-colors"
      >
        💧 Agregar vaso
      </motion.button>

      {completed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-green mt-2"
        >
          ¡Meta completada! +15 XP 🎉
        </motion.p>
      )}
    </div>
  );
}
