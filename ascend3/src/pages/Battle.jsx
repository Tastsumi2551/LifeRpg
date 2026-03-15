import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';

const SKILL_OPTIONS = [
  { value: 'mentalidad', label: '🧠 Mentalidad' },
  { value: 'salud', label: '❤️ Salud' },
  { value: 'economico', label: '💰 Económico' },
  { value: 'estudios', label: '📚 Estudios' },
  { value: 'alimentacion', label: '🍎 Alimentación' },
  { value: 'aprendizaje', label: '🎓 Aprendizaje' },
  { value: 'carisma', label: '✨ Carisma' },
];

export default function Battle() {
  const { badHabits, skills, addBadHabit, reportRelapse, deleteBadHabit } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form state
  const [habitName, setHabitName] = useState('');
  const [penalty, setPenalty] = useState(100);
  const [affectedSkill, setAffectedSkill] = useState('mentalidad');

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdd = () => {
    if (!habitName.trim()) return;
    addBadHabit({ name: habitName.trim(), penalty, affectedSkill });
    showNotif('🚫 ¡Hábito agregado! Ahora empieza tu batalla.');
    setHabitName('');
    setPenalty(100);
    setAffectedSkill('mentalidad');
    setShowModal(false);
  };

  const handleRelapse = (index) => {
    const habit = badHabits[index];
    if (confirm(`¿Seguro que quieres reportar una recaída? Perderás ${habit.penalty} XP.`)) {
      reportRelapse(index);
      showNotif(`💔 Recaída reportada. -${habit.penalty} XP de ${skills[habit.affectedSkill]?.icon} ${skills[habit.affectedSkill]?.name}`);
    }
  };

  const handleDelete = (index) => {
    if (confirm('¿Seguro que quieres eliminar este hábito?')) {
      deleteBadHabit(index);
    }
  };

  return (
    <div>
      <h2 className="section-title">🛡️ Batalla Anti-Dopamina</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
        Rompe los hábitos de dopamina barata. Si recaes, pierdes XP pero puedes recuperarte.
      </p>

      {/* Habits List */}
      {badHabits.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛡️</div>
          <p>No has agregado hábitos a romper.</p>
          <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Agrega un hábito para empezar tu batalla.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {badHabits.map((habit, index) => (
            <div
              key={habit.createdAt || index}
              className={`habit-card ${habit.cleanDays >= 7 ? 'clean' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  🚫 {habit.name}
                </div>
                <div style={{
                  background: habit.cleanDays >= 7 ? 'var(--green)' : 'var(--accent)',
                  color: '#000',
                  padding: '6px 14px',
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}>
                  {habit.cleanDays} días limpio
                </div>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
                Afecta: {skills[habit.affectedSkill]?.icon} {skills[habit.affectedSkill]?.name}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-danger" onClick={() => handleRelapse(index)}>
                  Reportar Recaída
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>

              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 10, fontStyle: 'italic' }}>
                Penalización: -{habit.penalty} XP
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button className="btn-primary" onClick={() => setShowModal(true)}>
        + Agregar Hábito a Romper
      </button>

      {/* Add Habit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>🚫 Nuevo Hábito a Romper</h3>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Nombre del Hábito</label>
              <input
                type="text"
                className="form-input"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Ej: Scrolling, Procrastinación..."
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Penalización (XP a perder si recaes)</label>
              <select className="form-input" value={penalty} onChange={(e) => setPenalty(Number(e.target.value))}>
                <option value={50}>-50 XP (Leve)</option>
                <option value={100}>-100 XP (Moderada)</option>
                <option value={200}>-200 XP (Severa)</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Área más afectada</label>
              <select className="form-input" value={affectedSkill} onChange={(e) => setAffectedSkill(e.target.value)}>
                {SKILL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAdd} style={{ flex: 1 }}>
                Agregar Hábito
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && <div className="notification">{notification}</div>}
    </div>
  );
}
