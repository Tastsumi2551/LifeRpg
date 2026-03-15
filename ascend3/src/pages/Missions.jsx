import { useState } from 'react';
import { useGameStore, XP_REWARDS } from '../stores/gameStore';

const SKILL_OPTIONS = [
  { value: 'economico', label: '💰 Económico' },
  { value: 'salud', label: '❤️ Salud' },
  { value: 'mentalidad', label: '🧠 Mentalidad' },
  { value: 'estudios', label: '📚 Estudios' },
  { value: 'alimentacion', label: '🍎 Alimentación' },
  { value: 'aprendizaje', label: '🎓 Aprendizaje' },
  { value: 'carisma', label: '✨ Carisma' },
];

export default function Missions() {
  const { missions, skills, completeMission, uncompleteMission, addMission, deleteMission } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState('economico');
  const [difficulty, setDifficulty] = useState('medium');
  const [isDaily, setIsDaily] = useState(false);

  const filteredMissions = missions.filter((m) => {
    if (filter === 'daily') return m.isDaily;
    if (filter === 'normal') return !m.isDaily;
    return true;
  });

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggle = (index) => {
    const realIndex = missions.indexOf(filteredMissions[index]);
    const mission = missions[realIndex];
    if (!mission.completed) {
      completeMission(realIndex);
      showNotif(`✅ ¡Misión completada! +${mission.xpReward} XP`);
    } else {
      uncompleteMission(realIndex);
    }
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    addMission({ title: title.trim(), skill, difficulty, isDaily });
    showNotif(isDaily ? '⭐ ¡Nueva misión diaria creada!' : '✨ ¡Nueva misión creada!');
    setTitle('');
    setSkill('economico');
    setDifficulty('medium');
    setIsDaily(false);
    setShowModal(false);
  };

  const handleDelete = (index) => {
    const realIndex = missions.indexOf(filteredMissions[index]);
    if (confirm('¿Seguro que quieres eliminar esta misión?')) {
      deleteMission(realIndex);
    }
  };

  return (
    <div>
      <h2 className="section-title">📋 Misiones</h2>

      {/* Filter Tabs */}
      <div className="tab-group">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'daily', label: 'Diarias' },
          { key: 'normal', label: 'Normales' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mission List */}
      {filteredMissions.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <p>No tienes misiones en esta categoría.</p>
          <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Agrega una misión para empezar a ganar XP.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {filteredMissions.map((mission, i) => (
            <div
              key={mission.createdAt || i}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: mission.completed ? 0.5 : 1,
                textDecoration: mission.completed ? 'line-through' : 'none',
                borderLeft: `4px solid ${skills[mission.skill]?.color || 'var(--accent)'}`,
                padding: '14px 18px',
              }}
            >
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={mission.completed}
                onChange={() => handleToggle(i)}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {mission.title}
                  {mission.isDaily && <span className="badge badge-daily">DIARIA</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                  +{mission.xpReward} XP en {skills[mission.skill]?.icon} {skills[mission.skill]?.name}
                </div>
              </div>
              <span className={`badge badge-${mission.difficulty}`}>
                {mission.difficulty === 'easy' ? 'Fácil' : mission.difficulty === 'medium' ? 'Media' : 'Difícil'}
              </span>
              <button
                onClick={() => handleDelete(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  opacity: 0.5,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.5}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button className="btn-primary" onClick={() => setShowModal(true)}>
        + Agregar Misión
      </button>

      {/* Add Mission Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>➕ Nueva Misión</h3>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Título de la Misión</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Hacer ejercicio 30 minutos"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Área</label>
              <select className="form-input" value={skill} onChange={(e) => setSkill(e.target.value)}>
                {SKILL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Dificultad</label>
              <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Fácil (+{XP_REWARDS.easy} XP)</option>
                <option value="medium">Media (+{XP_REWARDS.medium} XP)</option>
                <option value="hard">Difícil (+{XP_REWARDS.hard} XP)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)}
                id="isDailyCheck"
              />
              <label htmlFor="isDailyCheck" style={{ cursor: 'pointer', color: 'var(--gold)', fontWeight: 600 }}>
                ⭐ Misión Diaria (se reinicia cada día)
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAdd} style={{ flex: 1 }}>
                Crear Misión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && <div className="notification">{notification}</div>}
    </div>
  );
}
