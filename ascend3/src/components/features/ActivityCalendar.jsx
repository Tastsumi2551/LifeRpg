import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, subDays } from 'date-fns';

export default function ActivityCalendar() {
  const { user } = useAuthStore();
  const [activity, setActivity] = useState({});

  useEffect(() => {
    if (user) loadActivity();
  }, [user]);

  const loadActivity = async () => {
    if (!user) return;
    const data = {};
    // Load last 90 days of mission data
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      try {
        const missionDoc = await getDoc(doc(db, 'users', user.uid, 'missions', date));
        if (missionDoc.exists()) {
          const missions = missionDoc.data().missions || [];
          const completed = missions.filter((m) => m.completed).length;
          data[date] = completed;
        }
      } catch {
        // Skip failed reads
      }
      // Only load first 14 days quickly, rest lazily
      if (i === 14) break;
    }
    setActivity(data);
  };

  const days = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    days.push({ date, count: activity[date] || 0 });
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-bg-surface';
    if (count <= 2) return 'bg-accent/20';
    if (count <= 4) return 'bg-accent/40';
    if (count <= 6) return 'bg-accent/60';
    return 'bg-accent';
  };

  return (
    <div className="glass-card p-3">
      <h3 className="text-xs text-text-muted mb-2">📊 Actividad (90 días)</h3>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
        {days.map((day) => (
          <div
            key={day.date}
            className={`aspect-square rounded-sm ${getColor(day.count)} transition-colors`}
            title={`${day.date}: ${day.count} misiones`}
          />
        ))}
      </div>
    </div>
  );
}
