import { useGameStore } from '../stores/gameStore';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const {
    skills, totalXP, missionsCompleted, streak,
    getPlayerLevel, missions, badHabits,
  } = useGameStore();

  const playerLevel = getPlayerLevel();
  const pendingMissions = missions.filter((m) => !m.completed).length;
  const completedMissions = missions.filter((m) => m.completed).length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>⚔️ Dashboard</h1>
        <p>Tu progreso de hoy</p>
      </div>

      {/* Stat Cards */}
      <div className="grid-stats" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{playerLevel}</div>
          <div className="stat-label">Nivel</div>
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
          <div className="stat-value">{streak}🔥</div>
          <div className="stat-label">Racha</div>
        </div>
      </div>

      {/* Skills */}
      <div className="section-title"><span className="icon">🎯</span> Tus Habilidades</div>
      <div className="grid-skills" style={{ marginBottom: 28 }}>
        {Object.entries(skills).map(([key, skill]) => {
          const xpNeeded = skill.level * 100;
          const pct = Math.min((skill.xp / xpNeeded) * 100, 100);

          return (
            <div key={key} className="card">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {skill.icon} {skill.name}
                </span>
                <span
                  className="level-badge"
                  style={{ background: skill.color }}
                >
                  Nv. {skill.level}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.max(pct, 6)}%`,
                    background: `linear-gradient(90deg, ${skill.color}, ${skill.color}cc)`,
                  }}
                >
                  {Math.round(pct)}%
                </div>
              </div>
              <div style={{
                fontSize: '0.73rem',
                color: 'var(--text-dim)',
                textAlign: 'center',
                marginTop: 5,
              }}>
                {skill.xp} / {xpNeeded} XP
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="section-title"><span className="icon">⚡</span> Acceso Rápido</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 28 }}>
        {[
          { icon: '🎯', label: 'Misiones', sub: `${pendingMissions} pendientes`, path: '/missions' },
          { icon: '📅', label: 'Horario', sub: 'Ver semana', path: '/schedule' },
          { icon: '🛡️', label: 'Batalla', sub: `${badHabits.length} hábitos`, path: '/battle' },
          { icon: '💰', label: 'Finanzas', sub: 'Tracker', path: '/finance' },
        ].map((item) => (
          <div
            key={item.path}
            className="card card-interactive"
            onClick={() => navigate(item.path)}
            style={{ textAlign: 'center', padding: 16, cursor: 'pointer' }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Mission Summary */}
      <div className="section-title"><span className="icon">📋</span> Resumen de Misiones</div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Pendientes</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.88rem' }}>{pendingMissions}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Completadas hoy</span>
          <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.88rem' }}>{completedMissions}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Total</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{missions.length}</span>
        </div>
      </div>
    </div>
  );
}
