import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import Axel from '../components/features/Axel';
import HydrationTracker from '../components/features/HydrationTracker';
import PomodoroTimer from '../components/features/PomodoroTimer';
import ActivityCalendar from '../components/features/ActivityCalendar';
import WeeklyBoss from '../components/features/WeeklyBoss';
import AICoach from '../components/features/AICoach';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function getGreeting(hour) {
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function Home() {
  const { profile, schedule, missions, settings } = useGameStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[now.getDay()];
  const todaySchedule = schedule?.[todayName];
  const greeting = getGreeting(now.getHours());

  const completedMissions = missions.filter((m) => m.completed).length;
  const totalMissions = missions.length;

  const todayBlocks = useMemo(() => {
    if (!todaySchedule?.blocks) return [];
    return [...todaySchedule.blocks].sort((a, b) => a.start.localeCompare(b.start));
  }, [todaySchedule]);

  const currentBlock = todayBlocks.find((b) => {
    const nowTime = format(now, 'HH:mm');
    return nowTime >= b.start && nowTime < b.end;
  });

  const nextBlock = todayBlocks.find((b) => {
    const nowTime = format(now, 'HH:mm');
    return b.start > nowTime;
  });

  return (
    <div className="p-4 pb-6 flex flex-col gap-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            {greeting}, {profile.displayName || 'Aventurero'} 👋
          </h1>
          <p className="text-xs text-text-muted capitalize">
            {format(now, "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
        {profile.streak > 0 && (
          <div className="flex items-center gap-1 bg-gold/10 px-3 py-1 rounded-full">
            <span className="text-sm">🔥</span>
            <span className="text-gold font-mono text-sm font-semibold">{profile.streak}</span>
          </div>
        )}
      </motion.div>

      {/* Axel */}
      <Axel />

      {/* AI Coach */}
      <AICoach />

      {/* Quick Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3">
          <div className="text-xs text-text-muted mb-1">⚔️ Misiones</div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-mono font-bold text-text-primary">{completedMissions}</span>
            <span className="text-xs text-text-muted mb-0.5">/{totalMissions}</span>
          </div>
          <div className="w-full h-1.5 bg-bg-deep rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full transition-all"
              style={{ width: `${totalMissions ? (completedMissions / totalMissions) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-3">
          <div className="text-xs text-text-muted mb-1">
            {settings.modules?.gym && todaySchedule?.blocks?.some((b) => b.category === 'gym')
              ? '🏋️ Gym hoy'
              : '📅 Hoy'}
          </div>
          {currentBlock ? (
            <div>
              <span className="text-sm font-medium text-accent">{currentBlock.name}</span>
              <div className="text-[10px] text-text-muted mt-0.5">Ahora</div>
            </div>
          ) : nextBlock ? (
            <div>
              <span className="text-sm font-medium text-text-primary">{nextBlock.name}</span>
              <div className="text-[10px] text-text-muted mt-0.5">A las {nextBlock.start}</div>
            </div>
          ) : (
            <span className="text-sm text-text-muted">Sin bloques</span>
          )}
        </div>
      </div>

      {/* Today Timeline */}
      {todaySchedule?.active && todayBlocks.length > 0 && (
        <div className="glass-card p-3">
          <h3 className="text-xs text-text-muted mb-2">📅 Timeline de hoy</h3>
          <div className="flex flex-col gap-1">
            {todayBlocks.map((block, i) => {
              const nowTime = format(now, 'HH:mm');
              const isPast = nowTime > block.end;
              const isCurrent = nowTime >= block.start && nowTime < block.end;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    isCurrent ? 'bg-accent/15 border border-accent/30' : isPast ? 'opacity-50' : ''
                  }`}
                >
                  <span className="font-mono text-text-muted w-20">
                    {block.start}-{block.end}
                  </span>
                  <span className={isCurrent ? 'text-accent font-medium' : 'text-text-secondary'}>
                    {block.name}
                  </span>
                  {isCurrent && <span className="ml-auto text-accent text-[10px]">EN CURSO</span>}
                  {isPast && <span className="ml-auto">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hydration */}
      <HydrationTracker compact />

      {/* Boss */}
      <WeeklyBoss compact />

      {/* Pomodoro */}
      <PomodoroTimer compact />

      {/* Activity Calendar */}
      <ActivityCalendar />
    </div>
  );
}
