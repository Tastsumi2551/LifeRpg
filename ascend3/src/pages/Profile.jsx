import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, ACHIEVEMENTS } from '../stores/gameStore';
import { useAuth } from '../lib/useAuth';

const AVATARS = ['🧑‍💻', '🧙‍♂️', '🧝‍♀️', '🦸‍♂️', '🥷', '👨‍🚀', '🧑‍🎓', '🧑‍💼', '🦹‍♂️', '🧑‍🔬', '🧑‍🎨', '🧑‍🍳'];

export default function Profile() {
  const {
    displayName, avatar, skills, totalXP, missionsCompleted, streak,
    unlockedAchievements, getPlayerLevel, setDisplayName, setAvatar,
    badHabits, subjects, transactions,
  } = useGameStore();
  const { logout } = useAuth();
  const canvasRef = useRef(null);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);

  const level = getPlayerLevel();

  // ── Radar Chart ──
  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const size = Math.min(parent.offsetWidth - 32, 380);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.34;

    ctx.clearRect(0, 0, size, size);

    const arr = Object.values(skills);
    const angles = arr.map((_, i) => (i * 2 * Math.PI) / arr.length - Math.PI / 2);

    // Grid circles
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (r / 5) * i, 0, 2 * Math.PI);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Radial lines + labels
    const fontSize = Math.max(10, size * 0.03);
    ctx.font = `${fontSize}px Inter, Segoe UI, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    angles.forEach((angle, i) => {
      // Line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      const lr = r + 22;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(
        `${arr[i].icon} ${arr[i].name}`,
        cx + lr * Math.cos(angle),
        cy + lr * Math.sin(angle),
      );
    });

    // Skill polygon
    ctx.beginPath();
    angles.forEach((angle, i) => {
      const sr = (r / 10) * Math.min(arr[i].level, 10);
      const x = cx + sr * Math.cos(angle);
      const y = cy + sr * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(233, 69, 96, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Vertices
    angles.forEach((angle, i) => {
      const sr = (r / 10) * Math.min(arr[i].level, 10);
      ctx.beginPath();
      ctx.arc(cx + sr * Math.cos(angle), cy + sr * Math.sin(angle), 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#e94560';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [skills]);

  useEffect(() => {
    drawRadar();
    const handleResize = () => drawRadar();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawRadar]);

  const saveName = () => {
    if (nameInput.trim()) setDisplayName(nameInput.trim());
    setEditName(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>👤 Perfil</h1>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 22, padding: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>{avatar}</div>

        {editName ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10, maxWidth: 260, margin: '0 auto 10px' }}>
            <input
              className="form-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              style={{ textAlign: 'center' }}
              autoFocus
            />
            <button className="btn-primary" onClick={saveName} style={{ width: 'auto', padding: '8px 14px' }}>✓</button>
          </div>
        ) : (
          <div
            onClick={() => { setNameInput(displayName); setEditName(true); }}
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              marginBottom: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {displayName || 'Toca para poner tu nombre'}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>✏️</span>
          </div>
        )}

        <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.95rem' }}>
          Nivel {level}
        </div>

        {/* Avatar Picker */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 8 }}>Avatar:</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                style={{
                  background: a === avatar ? 'var(--accent)' : 'var(--bg-primary)',
                  border: `2px solid ${a === avatar ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '4px 8px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: 22 }}>
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
        <div className="stat-card">
          <div className="stat-value">{subjects.length}</div>
          <div className="stat-label">Materias</div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="section-title"><span className="icon">📊</span> Estadísticas</div>
      <div className="card" style={{ textAlign: 'center', marginBottom: 22, padding: '20px 10px' }}>
        <canvas ref={canvasRef} />
      </div>

      {/* Achievements */}
      <div className="section-title"><span className="icon">🏆</span> Logros ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
      <div className="grid-achievements" style={{ marginBottom: 22 }}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedAchievements.includes(a.id);
          return (
            <div key={a.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}>
              <div className="ach-icon">{a.icon}</div>
              <div className="ach-name">{a.name}</div>
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={() => { if (window.confirm('¿Cerrar sesión?')) logout(); }}
        className="btn-secondary"
        style={{ width: '100%', color: 'var(--accent)', marginBottom: 20 }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
