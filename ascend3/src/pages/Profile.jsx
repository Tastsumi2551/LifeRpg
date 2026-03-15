import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, ACHIEVEMENTS } from '../stores/gameStore';
import { useAuth } from '../lib/useAuth';

export default function Profile() {
  const {
    displayName, avatar, skills, totalXP, missionsCompleted, streak,
    unlockedAchievements, getPlayerLevel, setDisplayName, setAvatar,
  } = useGameStore();
  const { logout } = useAuth();
  const canvasRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);

  const playerLevel = getPlayerLevel();

  const AVATARS = ['🧑‍💻', '🧙‍♂️', '🧝‍♀️', '🦸‍♂️', '🥷', '👨‍🚀', '🧑‍🎓', '🧑‍💼', '🦹‍♂️', '🧑‍🔬'];

  // Draw radar chart
  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.parentElement.offsetWidth - 40, 360);
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.35;

    ctx.clearRect(0, 0, size, size);

    const skillArr = Object.values(skills);
    const angles = skillArr.map((_, i) => (i * 2 * Math.PI) / skillArr.length - Math.PI / 2);

    // Background circles
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius / 5) * i, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Radial lines and labels
    angles.forEach((angle, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      // Labels
      const labelR = radius + 24;
      const lx = cx + labelR * Math.cos(angle);
      const ly = cy + labelR * Math.sin(angle);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(10, size * 0.032)}px Segoe UI`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${skillArr[i].icon} ${skillArr[i].name}`, lx, ly);
    });

    // Skill polygon
    ctx.beginPath();
    ctx.strokeStyle = '#e94560';
    ctx.fillStyle = 'rgba(233, 69, 96, 0.25)';
    ctx.lineWidth = 2.5;

    angles.forEach((angle, i) => {
      const r = (radius / 10) * Math.min(skillArr[i].level, 10);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vertices
    angles.forEach((angle, i) => {
      const r = (radius / 10) * Math.min(skillArr[i].level, 10);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#e94560';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [skills]);

  useEffect(() => {
    drawRadar();
    window.addEventListener('resize', drawRadar);
    return () => window.removeEventListener('resize', drawRadar);
  }, [drawRadar]);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
    }
    setEditingName(false);
  };

  return (
    <div>
      {/* Profile Header */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>{avatar}</div>

        {editingName ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
            <input
              type="text"
              className="form-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              style={{ maxWidth: 200, textAlign: 'center' }}
              autoFocus
            />
            <button className="btn-primary" onClick={handleSaveName} style={{ width: 'auto', padding: '8px 16px' }}>
              ✓
            </button>
          </div>
        ) : (
          <div
            style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4, cursor: 'pointer' }}
            onClick={() => { setNameInput(displayName); setEditingName(true); }}
          >
            {displayName || 'Toca para poner tu nombre'}
            <span style={{ fontSize: '0.75rem', marginLeft: 8, color: 'var(--text-muted)' }}>✏️</span>
          </div>
        )}

        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>Nivel {playerLevel}</div>

        {/* Avatar Selection */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>Elige tu avatar:</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                style={{
                  background: a === avatar ? 'var(--accent)' : 'var(--bg-primary)',
                  border: `2px solid ${a === avatar ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10,
                  padding: '6px 10px',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid-stats" style={{ marginBottom: 24 }}>
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

      {/* Radar Chart */}
      <h2 className="section-title">📊 Estadísticas Visuales</h2>
      <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
        <canvas ref={canvasRef} />
      </div>

      {/* Achievements */}
      <h2 className="section-title">🏆 Logros</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedAchievements.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="icon">{achievement.icon}</div>
              <div className="name">{achievement.name}</div>
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="btn-secondary"
        style={{ width: '100%', color: 'var(--accent)' }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
