import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, subDays } from 'date-fns';

export default function WeeklyReport() {
  const { profile, settings } = useGameStore();
  const { user } = useAuthStore();
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (user) generateReport();
  }, [user]);

  const generateReport = async () => {
    if (!user) return;

    let totalMissions = 0;
    let completedMissions = 0;
    let xpEarned = 0;
    const dailyData = [];

    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      try {
        const missionDoc = await getDoc(doc(db, 'users', user.uid, 'missions', date));
        if (missionDoc.exists()) {
          const missions = missionDoc.data().missions || [];
          const completed = missions.filter((m) => m.completed).length;
          totalMissions += missions.length;
          completedMissions += completed;
          xpEarned += completed * 25; // approximate
          dailyData.push({ date, total: missions.length, completed, percent: missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0 });
        }
      } catch {}
    }

    const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
    const bestDay = dailyData.reduce((best, day) => (!best || day.percent > best.percent ? day : best), null);
    const worstDay = dailyData.reduce((worst, day) => (!worst || day.percent < worst.percent ? day : worst), null);

    setReport({
      totalMissions,
      completedMissions,
      completionRate,
      xpEarned,
      streak: profile.streak,
      level: profile.level,
      bestDay,
      worstDay,
      dailyData,
    });
  };

  if (!report) {
    return <div className="skeleton h-40 rounded-xl" />;
  }

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <h3 className="font-display text-sm font-bold text-text-primary">📊 Reporte Semanal</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-deep rounded-lg p-2 text-center">
          <p className="text-lg font-mono font-bold text-accent">{report.completionRate}%</p>
          <p className="text-[10px] text-text-muted">Misiones completadas</p>
        </div>
        <div className="bg-bg-deep rounded-lg p-2 text-center">
          <p className="text-lg font-mono font-bold text-gold">+{report.xpEarned}</p>
          <p className="text-[10px] text-text-muted">XP ganado</p>
        </div>
      </div>

      {/* Daily bars */}
      <div>
        <p className="text-xs text-text-muted mb-2">XP por día</p>
        <div className="flex items-end gap-1 h-16">
          {report.dailyData.reverse().map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full bg-gradient-to-t from-accent to-accent2 rounded-sm transition-all"
                style={{ height: `${Math.max(day.percent, 4)}%` }}
              />
              <span className="text-[8px] text-text-muted">{day.date.split('-')[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {report.bestDay && (
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">
            Mejor día: <span className="text-green">{report.bestDay.date.split('-')[2]} ({report.bestDay.percent}%)</span>
          </span>
          {report.worstDay && (
            <span className="text-text-muted">
              Peor: <span className="text-red">{report.worstDay.date.split('-')[2]} ({report.worstDay.percent}%)</span>
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span>🔥 Racha: {report.streak}</span>
        <span>·</span>
        <span>⭐ Nivel: {report.level}</span>
      </div>
    </div>
  );
}
