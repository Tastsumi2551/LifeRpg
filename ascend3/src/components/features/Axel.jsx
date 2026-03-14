import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';

const axelMessages = {
  morning: [
    "¡Buenos días {name}! ¿Listo para conquistar el día?",
    "¡Arriba {name}! Un nuevo día, nuevas misiones 🔥",
    "¡Hoy es tu día {name}! Vamos con todo",
    "Buenos días. Cada día es una oportunidad para crecer 🌅",
  ],
  afternoon: [
    "¿Cómo va el día {name}? ¡Sigue así!",
    "Mitad del día, {name}. ¡No bajes el ritmo! 💪",
    "¿Ya completaste tus misiones? Vamos {name}!",
  ],
  evening: [
    "Buenas noches {name}. Hoy lo hiciste genial 🌙",
    "Descansa bien {name}, mañana seguimos subiendo",
    "Gran día {name}. El descanso también es parte del progreso",
  ],
  streak: [
    "Llevas {streak} días seguidos, ¡eso es poder! 🔥",
    "{streak} días sin parar. ¡Imparable! ⚡",
    "Racha de {streak}. ¡Sigue sumando! 🐉",
  ],
  completed: [
    "¡WOW! Todas las misiones completadas. Eres una bestia 🔥",
    "¡Increíble {name}! Todo completado hoy 🎉",
    "100% hoy. Mira cuánto hemos crecido juntos...",
  ],
  lowActivity: [
    "Hey {name}, ¿todo bien? Revisa tus misiones 📋",
    "No te olvides de mí {name}... tus misiones esperan",
    "Un paso a la vez {name}. ¡Puedes hacerlo! 💪",
  ],
  newUser: [
    "¡Bienvenido a Ascend {name}! Juntos vamos a subir de nivel 🚀",
    "Soy Axel, tu compañero. ¡Empecemos esta aventura! 🐉",
    "Tip: completa tus misiones diarias para ganar XP y subir de nivel ⚡",
  ],
  highLevel: [
    "Mira cuánto hemos crecido juntos, {name}...",
    "Nivel {level}. Somos leyenda 🐉",
    "El camino es largo pero míranos, {name}. ¡Imparables!",
  ],
};

function getAxelStage(level) {
  if (level <= 5) return { emoji: '🥚', name: 'Huevo', animation: 'animate-wobble' };
  if (level <= 15) return { emoji: '🐣', name: 'Dragón Bebé', animation: 'animate-bounce-slow' };
  if (level <= 30) return { emoji: '🦎', name: 'Dragón Joven', animation: 'animate-float' };
  if (level <= 50) return { emoji: '🐲', name: 'Dragón Adulto', animation: 'animate-float' };
  return { emoji: '🐉', name: 'Dragón Legendario', animation: 'animate-float' };
}

function getMood(missions, streak) {
  const completed = missions.filter((m) => m.completed).length;
  const total = missions.length;
  const percent = total > 0 ? (completed / total) * 100 : 50;

  if (percent === 100 && completed > 0) return 'epic';
  if (percent >= 70) return 'happy';
  if (percent >= 30) return 'normal';
  return 'sad';
}

export default function Axel() {
  const { profile, missions } = useGameStore();
  const [messageIndex, setMessageIndex] = useState(0);

  const stage = getAxelStage(profile.level);
  const mood = getMood(missions, profile.streak);

  const message = useMemo(() => {
    const hour = new Date().getHours();
    let pool;

    const isNew = profile.totalXp < 100;
    const allDone = missions.length > 0 && missions.every((m) => m.completed);
    const lowActivity = missions.length > 0 && missions.filter((m) => m.completed).length / missions.length < 0.3;

    if (isNew) pool = axelMessages.newUser;
    else if (allDone) pool = axelMessages.completed;
    else if (profile.streak >= 3) pool = axelMessages.streak;
    else if (lowActivity && hour > 18) pool = axelMessages.lowActivity;
    else if (profile.level >= 30) pool = axelMessages.highLevel;
    else if (hour < 12) pool = axelMessages.morning;
    else if (hour < 18) pool = axelMessages.afternoon;
    else pool = axelMessages.evening;

    const idx = messageIndex % pool.length;
    return pool[idx]
      .replace('{name}', profile.displayName || 'Aventurero')
      .replace('{streak}', profile.streak)
      .replace('{level}', profile.level);
  }, [profile, missions, messageIndex]);

  useEffect(() => {
    setMessageIndex(Math.floor(Math.random() * 10));
  }, []);

  const moodColors = {
    epic: 'border-gold/30 bg-gold/5',
    happy: 'border-green/30 bg-green/5',
    normal: 'border-accent/20 bg-accent/5',
    sad: 'border-text-muted/20 bg-bg-surface',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 border ${moodColors[mood]}`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={
            mood === 'epic'
              ? { y: [0, -8, 0], rotate: [0, 5, -5, 0] }
              : mood === 'happy'
              ? { y: [0, -4, 0] }
              : mood === 'sad'
              ? { rotate: [0, -3, 0] }
              : {}
          }
          transition={{ repeat: Infinity, duration: mood === 'epic' ? 1 : 2 }}
          className="text-4xl"
        >
          {stage.emoji}
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-display font-bold text-text-primary">Axel</span>
            <span className="text-[10px] text-text-muted">• {stage.name}</span>
          </div>
          <div className="bg-bg-deep/50 rounded-xl rounded-tl-none p-3">
            <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
