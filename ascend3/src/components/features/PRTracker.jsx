import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../stores/authStore';

export default function PRTracker() {
  const { user } = useAuthStore();
  const [prs, setPRs] = useState({});

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const prDoc = await getDoc(doc(db, 'users', user.uid, 'gym', 'prs'));
      if (prDoc.exists()) setPRs(prDoc.data());
    };
    load();
  }, [user]);

  const entries = Object.entries(prs).filter(([key]) => key !== 'updatedAt');

  if (entries.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <span className="text-3xl mb-2 block">🏆</span>
        <p className="text-text-secondary text-sm">Aún no tienes PRs registrados</p>
        <p className="text-text-muted text-xs mt-1">Entrena y supera tus pesos para registrar PRs</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-bold text-text-primary">🏆 Personal Records</h2>
      {entries.map(([name, data]) => (
        <div key={name} className="glass-card p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">{name}</p>
            <p className="text-[10px] text-text-muted">
              {data.date ? new Date(data.date).toLocaleDateString() : '-'}
              {data.reps && ` · ${data.reps} reps`}
            </p>
          </div>
          <span className="text-lg font-mono font-bold text-gold">{data.weight} kg</span>
        </div>
      ))}
    </div>
  );
}
