import { useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useNavigate } from 'react-router-dom';

function Heatmap({ activityLog }) {
  const cells = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const count = activityLog[key] || 0;
      let level = '';
      if (count >= 6) level = 'l4';
      else if (count >= 4) level = 'l3';
      else if (count >= 2) level = 'l2';
      else if (count >= 1) level = 'l1';
      result.push({ key, level, count, date: key });
    }
    return result;
  }, [activityLog]);

  return (
    <div>
      <div className="heatmap">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`heatmap-cell ${c.level}`}
            title={`${c.date}: ${c.count} actividades`}
          />
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 8, fontSize: '0.7rem', color: 'var(--text-dim)',
      }}>
        <span>90 días atrás</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span>Menos</span>
          <div className="heatmap-cell" style={{ width: 10, height: 10 }} />
          <div className="heatmap-cell l1" style={{ width: 10, height: 10 }} />
          <div className="heatmap-cell l2" style={{ width: 10, height: 10 }} />
          <div className="heatmap-cell l3" style={{ width: 10, height: 10 }} />
          <div className="heatmap-cell l4" style={{ width: 10, height: 10 }} />
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const {
    skills, totalXP, missionsCompleted, streak, coins,
    getPlayerLevel, missions, badHabits, activityLog,
    pomodoroSessions,
  } = useGameStore();

  const playerLevel = getPlayerLevel();
  const pendingMissions = missions.filter((m) => !m.completed).length;
  const completedToday = missions.filter((m) => m.completed).length;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
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
          <div className="stat-value" style={{ color: 'var(--coin)' }}>{coins}</div>
          <div className="stat-label">Monedas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{streak}<span style={{ fontSize: '0.9rem' }}>🔥</span></div>
          <div className="stat-label">Racha</div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="section-title"><span className="icon">📊</span> Actividad (90 días)</div>
      <div className="card" style={{ marginBottom: 24 }}>
        <Heatmap activityLog={activityLog} />
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
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 10,
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {skill.icon} {skill.name}
                </span>
                <span className="level-badge" style={{ background: skill.color }}>
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
                fontSize: '0.73rem', color: 'var(--text-dim)',
                textAlign: 'center', marginTop: 5,
              }}>
                {skill.xp} / {xpNeeded} XP
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="section-title"><span className="icon">⚡</span> Acceso Rápido</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 10, marginBottom: 28,
      }}>
        {[
          { icon: '🎯', label: 'Misiones', sub: `${pendingMissions} pendientes`, path: '/missions' },
          { icon: '📅', label: 'Horario', sub: 'Ver semana', path: '/schedule' },
          { icon: '⚔️', label: 'Arsenal', sub: `${badHabits.length} batallas`, path: '/arsenal' },
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

      {/* Summary */}
      <div className="section-title"><span className="icon">📋</span> Resumen</div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Misiones pendientes</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.88rem' }}>{pendingMissions}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Completadas hoy</span>
          <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.88rem' }}>{completedToday}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Total misiones completadas</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{missionsCompleted}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Sesiones Pomodoro</span>
          <span style={{ fontWeight: 700, color: 'var(--purple)', fontSize: '0.88rem' }}>{pomodoroSessions}</span>
        </div>
      </div>
    </div>
  );
}
