import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, startOfWeek, endOfWeek } from 'date-fns';

function generateBoss(profile, settings) {
  const goesToGym = settings?.modules?.gym || settings?.healthGoals?.goesToGym;
  const gymDays = settings?.healthGoals?.gymDays || 3;
  const waterGoal = settings?.healthGoals?.waterGoal || 8;

  const bosses = [
    {
      name: 'Dragón de Cristal',
      emoji: '🐲',
      challenge: `Completa TODAS tus misiones por 5 días`,
      target: 5,
      type: 'missions',
    },
  ];

  if (goesToGym) {
    bosses.push({
      name: 'Golem de Acero',
      emoji: '🗿',
      challenge: `Entrena ${gymDays} veces esta semana`,
      target: gymDays,
      type: 'gym',
    });
  }

  bosses.push({
    name: 'Serpiente de Agua',
    emoji: '🐍',
    challenge: `Completa tu meta de agua por 7 días`,
    target: 7,
    type: 'water',
  });

  return bosses[Math.floor(Math.random() * bosses.length)];
}

export default function WeeklyBoss({ compact = false }) {
  const { profile, settings, addXP, addCoins } = useGameStore();
  const { user } = useAuthStore();
  const [boss, setBoss] = useState(null);
  const [progress, setProgress] = useState(0);

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) loadBoss();
  }, [user]);

  const loadBoss = async () => {
    if (!user) return;
    const bossDoc = await getDoc(doc(db, 'users', user.uid, 'boss', weekStart));
    if (bossDoc.exists()) {
      setBoss(bossDoc.data());
      setProgress(bossDoc.data().progress || 0);
    } else {
      const newBoss = {
        ...generateBoss(profile, settings),
        weekStart,
        progress: 0,
        defeated: false,
        rewarded: false,
      };
      await setDoc(doc(db, 'users', user.uid, 'boss', weekStart), newBoss);
      setBoss(newBoss);
    }
  };

  if (!boss) return null;

  const hpPercent = Math.max(0, 100 - (progress / boss.target) * 100);
  const defeated = progress >= boss.target;

  if (compact) {
    return (
      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{boss.emoji}</span>
            <span className="text-xs font-medium text-text-primary">{boss.name}</span>
          </div>
          {defeated && <span className="text-[10px] text-green font-medium">DERROTADO</span>}
        </div>
        <div className="w-full h-2 bg-bg-deep rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red to-gold rounded-full"
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-[10px] text-text-muted mt-1">{boss.challenge}</p>
      </div>
    );
  }

  return (
    <div className={`glass-card p-4 ${defeated ? 'border border-green/30' : 'border border-red/20'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display font-bold text-text-primary">⚔️ Boss Semanal</h3>
        {defeated && <span className="text-xs text-green font-medium">DERROTADO ✓</span>}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <motion.span
          animate={defeated ? { rotate: [0, 10, -10, 0] } : { scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-5xl"
        >
          {boss.emoji}
        </motion.span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{boss.name}</p>
          <p className="text-xs text-text-muted">{boss.challenge}</p>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-text-muted mb-0.5">
              <span>HP</span>
              <span>{Math.round(hpPercent)}%</span>
            </div>
            <div className="w-full h-3 bg-bg-deep rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red to-gold rounded-full"
                animate={{ width: `${hpPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {defeated && !boss.rewarded && (
        <p className="text-xs text-center text-gold">🏆 +200 XP +100 Coins</p>
      )}
      <p className="text-[10px] text-text-muted text-center">
        Progreso: {progress}/{boss.target}
      </p>
    </div>
  );
}
