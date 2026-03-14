import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';

const coachMessages = {
  gym: [
    "💪 {name}, no olvides que hoy toca gym. ¡Tu cuerpo te lo agradecerá!",
    "Tus músculos no crecen en la zona de confort, {name}. ¡Ve al gym!",
    "Cada entrenamiento te acerca a tu meta, {name}. No lo saltes hoy.",
  ],
  nutrition: [
    "🍽️ Tus calorías van algo lejos de tu meta. Intenta ajustar hoy.",
    "Recuerda comer suficiente proteína, {name}. Tu meta es {proteinGoal}g.",
    "La nutrición es el 80% del resultado. ¡Come bien hoy, {name}!",
  ],
  water: [
    "💧 Tu hidratación ha estado baja estos días. ¡Toma más agua!",
    "El agua es vida, {name}. No olvides tus {waterGoal} vasos diarios.",
  ],
  streak: [
    "🔥 ¡Gran racha! Llevas {streak} días seguidos. No pares ahora.",
    "¡{streak} días de consistencia! Eso es disciplina real, {name}.",
  ],
  general: [
    "Cada día que completas tus misiones, estás más cerca de tu mejor versión.",
    "La constancia supera al talento. Sigue así, {name}.",
    "Un paso a la vez. Lo importante es no parar, {name}.",
    "Hoy es un buen día para superarte, {name}. ¡Vamos!",
  ],
  newUser: [
    "Tip: Completa tus misiones diarias para ganar XP y subir de nivel ⚡",
    "Tip: Configura tu horario desde el perfil para misiones personalizadas 📋",
    "Tip: Visita la tienda para canjear tus coins por recompensas 🎁",
    "¡Bienvenido! Los primeros días son los más importantes. ¡Tú puedes!",
  ],
  improvement: [
    "📈 Eres más productivo los días que completas temprano tus misiones.",
    "Tu consistencia ha mejorado esta semana. ¡Sigue así!",
  ],
};

export default function AICoach() {
  const { profile, missions, settings } = useGameStore();
  const [visible, setVisible] = useState(true);

  const message = useMemo(() => {
    const name = profile.displayName || 'Aventurero';
    const isNew = profile.totalXp < 200;
    const goesToGym = settings?.modules?.gym;
    const waterGoal = settings?.healthGoals?.waterGoal || 8;
    const proteinGoal = settings?.healthGoals?.proteinGoal || 150;

    let pool;
    if (isNew) {
      pool = coachMessages.newUser;
    } else if (profile.streak >= 5) {
      pool = coachMessages.streak;
    } else if (goesToGym && Math.random() > 0.6) {
      pool = coachMessages.gym;
    } else {
      pool = coachMessages.general;
    }

    const msg = pool[Math.floor(Math.random() * pool.length)];
    return msg
      .replace(/{name}/g, name)
      .replace(/{streak}/g, profile.streak)
      .replace(/{waterGoal}/g, waterGoal)
      .replace(/{proteinGoal}/g, proteinGoal);
  }, [profile, settings]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3 border border-cyan/20 bg-cyan/5"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">🧠</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-display font-bold text-cyan">COACH</span>
            <button onClick={() => setVisible(false)} className="text-text-muted text-xs hover:text-text-secondary">×</button>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
