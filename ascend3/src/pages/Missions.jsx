import { useState } from 'react';
import { useGameStore, XP_REWARDS, COIN_REWARDS, SKILL_OPTIONS } from '../stores/gameStore';

export default function Missions() {
  const {
    missions, skills, completeMission, uncompleteMission,
    addMission, deleteMission,
  } = useGameStore();

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  // Form
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState('economico');
  const [difficulty, setDifficulty] = useState('medium');
  const [isDaily, setIsDaily] = useState(false);

  const filtered = missions.filter((m) => {
    if (filter === 'daily') return m.isDaily;
    if (filter === 'normal') return !m.isDaily;
    if (filter === 'pending') return !m.completed;
    return true;
  });

  const handleToggle = (filteredIdx) => {
    const mission = filtered[filteredIdx];
    const realIdx = missions.indexOf(mission);
    if (!mission.completed) {
      completeMission(realIdx);
    } else {
      uncompleteMission(realIdx);
    }
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    addMission({ title: title.trim(), skill, difficulty, isDaily });
    setTitle('');
    setSkill('economico');
    setDifficulty('medium');
    setIsDaily(false);
    setShowModal(false);
  };

  const handleDelete = (filteredIdx) => {
    const mission = filtered[filteredIdx];
    const realIdx = missions.indexOf(mission);
    if (window.confirm('Eliminar esta mision?')) {
      deleteMission(realIdx);
    }
  };

  const diffLabel = { easy: 'Facil', medium: 'Media', hard: 'Dificil' };

  return (
    <div>
      <div className="page-header">
        <h1>Misiones</h1>
        <p>Completa misiones para ganar XP y monedas</p>
      </div>

      {/* Filters */}
      <div className="tab-group">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'daily', label: 'Diarias' },
          { key: 'normal', label: 'Normales' },
        ].map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mission List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p>No hay misiones aqui.</p>
          <p className="sub">Crea una mision para empezar a ganar XP.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {filtered.map((mission, i) => (
            <div
              key={mission.createdAt || i}
              className={`mission-item ${mission.completed ? 'completed' : ''}`}
              style={{ borderLeft: `3px solid ${skills[mission.skill]?.color || 'var(--accent)'}` }}
            >
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={mission.completed || false}
                onChange={() => handleToggle(i)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mission-title" style={{
                  fontWeight: 600, fontSize: '0.9rem', marginBottom: 3,
                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                }}>
                  <span>{mission.title}</span>
                  {mission.isDaily && <span className="badge badge-daily">Diaria</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  +{mission.xpReward} XP · +{COIN_REWARDS[mission.difficulty] || 5} 🪙 · {skills[mission.skill]?.icon} {skills[mission.skill]?.name}
                </div>
              </div>
              <span className={`badge badge-${mission.difficulty}`}>
                {diffLabel[mission.difficulty]}
              </span>
              <button className="btn-ghost" onClick={() => handleDelete(i)} title="Eliminar">
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button className="btn-primary" onClick={() => setShowModal(true)}>
        + Agregar Mision
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>Nueva Mision</h3>

            <div className="form-group">
              <label className="form-label">Titulo de la mision</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Hacer ejercicio 30 min"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Area / Habilidad</label>
              <select className="form-input" value={skill} onChange={(e) => setSkill(e.target.value)}>
                {SKILL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dificultad</label>
              <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Facil (+{XP_REWARDS.easy} XP · +{COIN_REWARDS.easy} 🪙)</option>
                <option value="medium">Media (+{XP_REWARDS.medium} XP · +{COIN_REWARDS.medium} 🪙)</option>
                <option value="hard">Dificil (+{XP_REWARDS.hard} XP · +{COIN_REWARDS.hard} 🪙)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)}
                id="dailyCheck"
              />
              <label
                htmlFor="dailyCheck"
                style={{ cursor: 'pointer', color: 'var(--gold)', fontWeight: 600, fontSize: '0.88rem' }}
              >
                Mision diaria (se reinicia cada dia)
              </label>
            </div>

            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAdd}>Crear Mision</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
