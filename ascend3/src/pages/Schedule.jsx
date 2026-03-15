import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_KEYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const HOURS = [];
for (let h = 5; h <= 23; h++) {
  HOURS.push(`${h.toString().padStart(2, '0')}:00`);
}

const CATEGORIES = [
  { value: 'estudio', label: '📚 Estudio', color: '#60a5fa' },
  { value: 'gym', label: '💪 Gym', color: '#e94560' },
  { value: 'trabajo', label: '💼 Trabajo', color: '#4ecca3' },
  { value: 'libre', label: '🎮 Libre', color: '#a78bfa' },
  { value: 'comida', label: '🍎 Comida', color: '#34d399' },
  { value: 'descanso', label: '😴 Descanso', color: '#64748b' },
  { value: 'otro', label: '📌 Otro', color: '#fbbf24' },
];

export default function Schedule() {
  const { schedule, updateSchedule } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form state
  const [blockName, setBlockName] = useState('');
  const [blockCategory, setBlockCategory] = useState('estudio');

  const getSlotData = (dayKey, hour) => {
    return schedule?.[dayKey]?.[hour] || null;
  };

  const getCategoryInfo = (categoryValue) => {
    return CATEGORIES.find((c) => c.value === categoryValue) || CATEGORIES[6];
  };

  const handleSlotClick = (dayIndex, hour) => {
    const dayKey = DAY_KEYS[dayIndex];
    const existing = getSlotData(dayKey, hour);

    if (existing) {
      // Remove the block
      if (confirm(`¿Eliminar "${existing.name}" de ${DAYS[dayIndex]} ${hour}?`)) {
        const newSchedule = { ...schedule };
        const daySchedule = { ...newSchedule[dayKey] };
        delete daySchedule[hour];
        newSchedule[dayKey] = daySchedule;
        updateSchedule(newSchedule);
        setNotification('🗑️ Bloque eliminado');
        setTimeout(() => setNotification(null), 2000);
      }
      return;
    }

    setSelectedSlot({ dayIndex, dayKey: DAY_KEYS[dayIndex], hour });
    setBlockName('');
    setBlockCategory('estudio');
    setShowModal(true);
  };

  const handleAddBlock = () => {
    if (!blockName.trim() || !selectedSlot) return;

    const newSchedule = { ...schedule };
    if (!newSchedule[selectedSlot.dayKey]) {
      newSchedule[selectedSlot.dayKey] = {};
    }
    newSchedule[selectedSlot.dayKey] = {
      ...newSchedule[selectedSlot.dayKey],
      [selectedSlot.hour]: {
        name: blockName.trim(),
        category: blockCategory,
      },
    };

    updateSchedule(newSchedule);
    setShowModal(false);
    setNotification('✅ Bloque agregado al horario');
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <div>
      <h2 className="section-title">📅 Tu Horario Semanal</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
        Toca una celda vacía para agregar un bloque. Toca un bloque existente para eliminarlo.
      </p>

      {/* Schedule Grid */}
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <div className="schedule-grid" style={{ minWidth: 700 }}>
          {/* Header row */}
          <div /> {/* Empty corner */}
          {DAYS.map((day) => (
            <div key={day} className="day-header">{day}</div>
          ))}

          {/* Time rows */}
          {HOURS.map((hour) => (
            <>
              <div key={`label-${hour}`} className="time-label">{hour}</div>
              {DAY_KEYS.map((dayKey, dayIndex) => {
                const data = getSlotData(dayKey, hour);
                const cat = data ? getCategoryInfo(data.category) : null;

                return (
                  <div
                    key={`${dayKey}-${hour}`}
                    className={`slot ${data ? 'filled' : ''}`}
                    style={data ? {
                      background: `${cat.color}22`,
                      borderColor: cat.color,
                      color: cat.color,
                    } : {}}
                    onClick={() => handleSlotClick(dayIndex, hour)}
                  >
                    {data && data.name}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Category Legend */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
          Categorías
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.value} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
            }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: cat.color,
              }} />
              <span style={{ color: 'var(--text-secondary)' }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Block Modal */}
      {showModal && selectedSlot && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>📌 Agregar Bloque</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              {DAYS[selectedSlot.dayIndex]} a las {selectedSlot.hour}
            </p>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-input"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                placeholder="Ej: Matemáticas, Gym, Trabajo..."
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Categoría</label>
              <select className="form-input" value={blockCategory} onChange={(e) => setBlockCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAddBlock} style={{ flex: 1 }}>
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && <div className="notification">{notification}</div>}
    </div>
  );
}
