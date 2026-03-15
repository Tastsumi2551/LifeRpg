import { useGameStore } from '../stores/gameStore';

export default function Home() {
  const { skills, totalXP, missionsCompleted, streak, getPlayerLevel, missions } = useGameStore();
  const playerLevel = getPlayerLevel();

  const todayMissions = missions.filter((m) => !m.completed);
  const completedToday = missions.filter((m) => m.completed);

  return (
    <div>
      {/* Header Stats */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
          ⚔️ LIFE RPG v2.0
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Tu progreso de hoy
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid-stats" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{playerLevel}</div>
          <div className="stat-label">Nivel General</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalXP.toLocaleString()}</div>
          <div className="stat-label">XP Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{missionsCompleted}</div>
          <div className="stat-label">Misiones</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{streak} 🔥</div>
          <div className="stat-label">Racha</div>
        </div>
      </div>

      {/* Skills Grid */}
      <h2 className="section-title">🎯 Tus Habilidades</h2>
      <div className="grid-skills" style={{ marginBottom: 24 }}>
        {Object.entries(skills).map(([key, skill]) => {
          const xpForNext = skill.level * 100;
          const progress = Math.min((skill.xp / xpForNext) * 100, 100);

          return (
            <div key={key} className="card" style={{ transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {skill.icon} {skill.name}
                </span>
                <span style={{
                  background: skill.color,
                  padding: '4px 12px',
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#000',
                }}>
                  Nv. {skill.level}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.max(progress, 8)}%`,
                    background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`,
                  }}
                >
                  {Math.round(progress)}%
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
                {skill.xp} / {xpForNext} XP
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Mission Summary */}
      <h2 className="section-title">📋 Resumen de Misiones</h2>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Pendientes</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{todayMissions.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Completadas</span>
          <span style={{ fontWeight: 700, color: 'var(--green)' }}>{completedToday.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total</span>
          <span style={{ fontWeight: 700 }}>{missions.length}</span>
        </div>
      </div>
    </div>
  );
}
