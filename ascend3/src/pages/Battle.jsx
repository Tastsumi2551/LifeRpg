import { useState } from 'react';
import { useGameStore, SKILL_OPTIONS } from '../stores/gameStore';

export default function Battle() {
  const { badHabits, skills, addBadHabit, reportRelapse, deleteBadHabit } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [notif, setNotif] = useState(null);

  // Form
  const [habitName, setHabitName] = useState('');
  const [penalty, setPenalty] = useState(100);
  const [affectedSkill, setAffectedSkill] = useState('mentalidad');

  const notify = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleAdd = () => {
    if (!habitName.trim()) return;
    addBadHabit({ name: habitName.trim(), penalty, affectedSkill });
    notify('🚫 Hábito agregado. ¡Empieza tu batalla!');
    setHabitName('');
    setPenalty(100);
    setAffectedSkill('mentalidad');
    setShowModal(false);
  };

  const handleRelapse = (i) => {
    const habit = badHabits[i];
    if (window.confirm(`¿Reportar recaída? Perderás ${habit.penalty} XP.`)) {
      reportRelapse(i);
      notify(`💔 Recaída. -${habit.penalty} XP en ${skills[habit.affectedSkill]?.icon} ${skills[habit.affectedSkill]?.name}`);
    }
  };

  const handleDelete = (i) => {
    if (window.confirm('¿Eliminar este hábito?')) {
      deleteBadHabit(i);
    }
  };

  // Stats
  const totalCleanDays = badHabits.reduce((s, h) => s + h.cleanDays, 0);
  const maxClean = badHabits.reduce((m, h) => Math.max(m, h.cleanDays), 0);

  return (
    <div>
      <div className="page-header">
        <h1>🛡️ Batalla Anti-Dopamina</h1>
        <p>Rompe los hábitos de dopamina barata. Si recaes, pierdes XP.</p>
      </div>

      {/* Summary Stats */}
      {badHabits.length > 0 && (
        <div className="grid-stats" style={{ marginBottom: 22, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--green)' }}>{badHabits.length}</div>
            <div className="stat-label">Hábitos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--green)' }}>{totalCleanDays}</div>
            <div className="stat-label">Días limpios total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{maxClean}</div>
            <div className="stat-label">Mejor racha</div>
          </div>
        </div>
      )}

      {/* Habits List */}
      {badHabits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛡️</div>
          <p>No tienes hábitos a romper.</p>
          <p className="sub">Agrega un hábito para empezar tu batalla.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {badHabits.map((habit, i) => (
            <div
              key={habit.createdAt || i}
              className={`habit-card ${habit.cleanDays >= 7 ? 'clean' : ''}`}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  🚫 {habit.name}
                </div>
                <div style={{
                  background: habit.cleanDays >= 7 ? 'var(--green)' : 'var(--accent)',
                  color: '#000',
                  padding: '5px 14px',
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                }}>
                  {habit.cleanDays} días
                </div>
              </div>

              {/* Info */}
              <div style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>Afecta: {skills[habit.affectedSkill]?.icon} {skills[habit.affectedSkill]?.name}</span>
                <span style={{ color: '#ef4444' }}>Penalización: -{habit.penalty} XP</span>
              </div>

              {/* Progress bar - visual of clean days */}
              {habit.cleanDays > 0 && (
                <div className="progress-bar" style={{ height: 10, marginBottom: 14 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((habit.cleanDays / 30) * 100, 100)}%`,
                      background: habit.cleanDays >= 7
                        ? 'linear-gradient(90deg, var(--green), #34d399)'
                        : 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                      fontSize: 0,
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-danger" onClick={() => handleRelapse(i)}>
                  Reportar Recaída
                </button>
                <button className="btn-ghost" onClick={() => handleDelete(i)} style={{ fontSize: '0.82rem' }}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button className="btn-primary" onClick={() => setShowModal(true)}>
        + Agregar Hábito a Romper
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>🚫 Nuevo Hábito a Romper</h3>

            <div className="form-group">
              <label className="form-label">Nombre del hábito</label>
              <input
                className="form-input"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Ej: Scrolling, Procrastinación..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Penalización (XP a perder si recaes)</label>
              <select className="form-input" value={penalty} onChange={(e) => setPenalty(Number(e.target.value))}>
                <option value={50}>-50 XP (Leve)</option>
                <option value={100}>-100 XP (Moderada)</option>
                <option value={200}>-200 XP (Severa)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Área más afectada</label>
              <select className="form-input" value={affectedSkill} onChange={(e) => setAffectedSkill(e.target.value)}>
                {SKILL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAdd}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {notif && <div className="notification">{notif}</div>}
    </div>
  );
}
