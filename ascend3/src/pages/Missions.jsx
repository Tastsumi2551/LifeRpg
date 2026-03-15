import { useState } from 'react';
import { useGameStore, XP_REWARDS, COIN_REWARDS, SKILL_OPTIONS } from '../stores/gameStore';

export default function Missions() {
  const {
    missions, skills, completeMission, uncompleteMission,
    addMission, deleteMission,
  } = useGameStore();

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

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
    setTitle(''); setSkill('economico'); setDifficulty('medium'); setIsDaily(false);
    setShowModal(false);
  };

  const handleDelete = (filteredIdx) => {
    const mission = filtered[filteredIdx];
    const realIdx = missions.indexOf(mission);
    if (window.confirm('Eliminar esta mision?')) deleteMission(realIdx);
  };

  const diffLabel = { easy: 'Facil', medium: 'Media', hard: 'Dificil' };

  return (
    <div>
      <div className="page-header">
        <h1>Misiones</h1>
        <p>Completa misiones para ganar XP y monedas</p>
      </div>

      <div className="tab-group">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'daily', label: 'Diarias' },
          { key: 'normal', label: 'Normales' },
        ].map((t) => (
          <button key={t.key} className={`tab-btn ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}>{t.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">--</div>
          <p>No hay misiones aqui</p>
          <p className="sub">Crea una mision para empezar a ganar XP</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {filtered.map((mission, i) => (
            <div key={mission.createdAt || i}
              className={`mission-item ${mission.completed ? 'completed' : ''}`}
              style={{ borderLeft: `3px solid ${skills[mission.skill]?.color || 'var(--accent)'}` }}
            >
              <input type="checkbox" className="custom-checkbox"
                checked={mission.completed || false} onChange={() => handleToggle(i)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mission-title" style={{
                  fontWeight: 600, fontSize: '0.88rem', marginBottom: 2,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>{mission.title}</span>
                  {mission.isDaily && <span className="badge badge-daily">Diaria</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  +{mission.xpReward} XP · +{COIN_REWARDS[mission.difficulty] || 5} monedas · {skills[mission.skill]?.name}
                </div>
              </div>
              <span className={`badge badge-${mission.difficulty}`}>{diffLabel[mission.difficulty]}</span>
              <button className="btn-ghost" onClick={() => handleDelete(i)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={() => setShowModal(true)}>
        Agregar mision
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>Nueva mision</h3>
            <div className="form-group">
              <label className="form-label">Titulo</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Hacer ejercicio 30 min" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            </div>
            <div className="form-group">
              <label className="form-label">Habilidad</label>
              <select className="form-input" value={skill} onChange={(e) => setSkill(e.target.value)}>
                {SKILL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Dificultad</label>
              <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Facil (+{XP_REWARDS.easy} XP, +{COIN_REWARDS.easy} monedas)</option>
                <option value="medium">Media (+{XP_REWARDS.medium} XP, +{COIN_REWARDS.medium} monedas)</option>
                <option value="hard">Dificil (+{XP_REWARDS.hard} XP, +{COIN_REWARDS.hard} monedas)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <input type="checkbox" className="custom-checkbox" checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)} id="dailyCheck" />
              <label htmlFor="dailyCheck" style={{ cursor: 'pointer', color: 'var(--coin)', fontWeight: 600, fontSize: '0.85rem' }}>
                Mision diaria (se reinicia cada dia)
              </label>
            </div>
            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAdd}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
