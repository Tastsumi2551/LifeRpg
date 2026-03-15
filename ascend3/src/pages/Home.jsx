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
          <div key={c.key} className={`heatmap-cell ${c.level}`} title={`${c.date}: ${c.count}`} />
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 8, fontSize: '0.68rem', color: 'var(--text-disabled)',
      }}>
        <span>90 dias</span>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <span>Menos</span>
          <div className="heatmap-cell" style={{ width: 9, height: 9 }} />
          <div className="heatmap-cell l1" style={{ width: 9, height: 9 }} />
          <div className="heatmap-cell l2" style={{ width: 9, height: 9 }} />
          <div className="heatmap-cell l3" style={{ width: 9, height: 9 }} />
          <div className="heatmap-cell l4" style={{ width: 9, height: 9 }} />
          <span>Mas</span>
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

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: 20 }}>
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
          <div className="stat-value">{streak}<span style={{ fontSize: '0.7rem', marginLeft: 2 }}>dias</span></div>
          <div className="stat-label">Racha</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="section-title">Actividad</div>
      <div className="card" style={{ marginBottom: 24 }}>
        <Heatmap activityLog={activityLog} />
      </div>

      {/* Skills */}
      <div className="section-title">Habilidades</div>
      <div className="grid-skills" style={{ marginBottom: 24 }}>
        {Object.entries(skills).map(([key, skill]) => {
          const xpNeeded = skill.level * 100;
          const pct = Math.min((skill.xp / xpNeeded) * 100, 100);
          return (
            <div key={key} className="card" style={{ padding: '14px 16px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.9rem' }}>{skill.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {skill.name}
                  </span>
                </div>
                <span className="level-badge" style={{ background: skill.color, opacity: 0.9 }}>
                  Nv. {skill.level}
                </span>
              </div>
              <div className="progress-bar labeled">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.max(pct, 8)}%`,
                    background: skill.color,
                  }}
                >
                  {Math.round(pct)}%
                </div>
              </div>
              <div style={{
                fontSize: '0.7rem', color: 'var(--text-disabled)',
                textAlign: 'right', marginTop: 4,
              }}>
                {skill.xp}/{xpNeeded} XP
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="section-title">Acceso rapido</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 8, marginBottom: 24,
      }}>
        {[
          { label: 'Misiones', sub: `${pendingMissions} pendientes`, path: '/missions' },
          { label: 'Horario', sub: 'Ver semana', path: '/schedule' },
          { label: 'Arsenal', sub: `Pomodoro + Batalla`, path: '/arsenal' },
          { label: 'Finanzas', sub: 'Tracker', path: '/finance' },
        ].map((item) => (
          <div
            key={item.path}
            className="card card-interactive"
            onClick={() => navigate(item.path)}
            style={{ textAlign: 'center', padding: 14, cursor: 'pointer' }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2, color: 'var(--text-primary)' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="section-title">Resumen</div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {[
          { label: 'Misiones pendientes', value: pendingMissions, color: 'var(--accent)' },
          { label: 'Completadas hoy', value: completedToday, color: 'var(--success)' },
          { label: 'Total completadas', value: missionsCompleted, color: 'var(--text-primary)' },
          { label: 'Sesiones Pomodoro', value: pomodoroSessions, color: 'var(--purple)' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.label}</span>
            <span style={{ fontWeight: 700, color: item.color, fontSize: '0.85rem' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
