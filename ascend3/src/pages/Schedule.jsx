import { useState } from 'react';
import { useGameStore, SCHEDULE_CATEGORIES } from '../stores/gameStore';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_KEYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const HOURS = [];
for (let h = 6; h <= 22; h++) {
  HOURS.push(`${h.toString().padStart(2, '0')}:00`);
}

const SUBJECT_COLORS = [
  '#e94560', '#60a5fa', '#4ecca3', '#fbbf24', '#a78bfa',
  '#f472b6', '#34d399', '#fb923c', '#38bdf8', '#c084fc',
];

export default function Schedule() {
  const {
    schedule, updateSchedule,
    subjects, addSubject, deleteSubject,
    exams, addExam, deleteExam,
  } = useGameStore();

  const [tab, setTab] = useState('horario');
  const [notif, setNotif] = useState(null);

  // Schedule modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [blockName, setBlockName] = useState('');
  const [blockCategory, setBlockCategory] = useState('clase');

  // Subject modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subName, setSubName] = useState('');
  const [subProfessor, setSubProfessor] = useState('');
  const [subColor, setSubColor] = useState(SUBJECT_COLORS[0]);
  const [subRoom, setSubRoom] = useState('');

  // Exam modal
  const [showExamModal, setShowExamModal] = useState(false);
  const [examName, setExamName] = useState('');
  const [examSubjectId, setExamSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');

  const notify = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 2500);
  };

  // ── Schedule Handlers ──

  const getSlot = (dayKey, hour) => schedule?.[dayKey]?.[hour] || null;

  const getCat = (val) => SCHEDULE_CATEGORIES.find((c) => c.value === val) || SCHEDULE_CATEGORIES[7];

  const handleSlotClick = (dayIdx, hour) => {
    const dayKey = DAY_KEYS[dayIdx];
    const existing = getSlot(dayKey, hour);

    if (existing) {
      if (window.confirm(`¿Eliminar "${existing.name}" de ${DAYS[dayIdx]} ${hour}?`)) {
        const newSched = { ...schedule };
        const day = { ...newSched[dayKey] };
        delete day[hour];
        newSched[dayKey] = day;
        updateSchedule(newSched);
        notify('🗑️ Bloque eliminado');
      }
      return;
    }

    setSelectedSlot({ dayIdx, dayKey, hour });
    setBlockName('');
    setBlockCategory('clase');
    setShowBlockModal(true);
  };

  const handleAddBlock = () => {
    if (!blockName.trim() || !selectedSlot) return;
    const newSched = { ...schedule };
    if (!newSched[selectedSlot.dayKey]) newSched[selectedSlot.dayKey] = {};
    newSched[selectedSlot.dayKey] = {
      ...newSched[selectedSlot.dayKey],
      [selectedSlot.hour]: { name: blockName.trim(), category: blockCategory },
    };
    updateSchedule(newSched);
    setShowBlockModal(false);
    notify('✅ Bloque agregado');
  };

  // ── Subject Handlers ──

  const handleAddSubject = () => {
    if (!subName.trim()) return;
    addSubject({
      name: subName.trim(),
      professor: subProfessor.trim(),
      color: subColor,
      room: subRoom.trim(),
    });
    setSubName('');
    setSubProfessor('');
    setSubRoom('');
    setSubColor(SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)]);
    setShowSubjectModal(false);
    notify('📚 Materia agregada');
  };

  const handleDeleteSubject = (id) => {
    if (window.confirm('¿Eliminar esta materia y sus exámenes?')) {
      deleteSubject(id);
    }
  };

  // ── Exam Handlers ──

  const handleAddExam = () => {
    if (!examName.trim() || !examDate) return;
    addExam({
      name: examName.trim(),
      subjectId: examSubjectId,
      date: examDate,
    });
    setExamName('');
    setExamDate('');
    setShowExamModal(false);
    notify('📝 Examen agregado');
  };

  const getSubjectById = (id) => subjects.find((s) => s.id === id);

  // Sort exams by date
  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  const daysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Pasado';
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `${diff} días`;
  };

  return (
    <div>
      <div className="page-header">
        <h1>📅 Horario y Materias</h1>
        <p>Organiza tu semana y tus clases</p>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        <button className={`tab-btn ${tab === 'horario' ? 'active' : ''}`} onClick={() => setTab('horario')}>
          📅 Horario Semanal
        </button>
        <button className={`tab-btn ${tab === 'materias' ? 'active' : ''}`} onClick={() => setTab('materias')}>
          📚 Materias
        </button>
        <button className={`tab-btn ${tab === 'examenes' ? 'active' : ''}`} onClick={() => setTab('examenes')}>
          📝 Exámenes
        </button>
      </div>

      {/* ═══ TAB: HORARIO ═══ */}
      {tab === 'horario' && (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 14 }}>
            Toca una celda vacía para agregar. Toca un bloque para eliminarlo.
          </p>

          <div className="schedule-wrapper" style={{ marginBottom: 18 }}>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  {DAYS.map((d) => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td>{hour}</td>
                    {DAY_KEYS.map((dayKey, dayIdx) => {
                      const data = getSlot(dayKey, hour);
                      const cat = data ? getCat(data.category) : null;
                      return (
                        <td key={dayKey}>
                          <div
                            className={`schedule-slot ${data ? 'filled' : ''}`}
                            style={data ? {
                              background: `${cat.color}cc`,
                            } : {}}
                            onClick={() => handleSlotClick(dayIdx, hour)}
                          >
                            {data ? data.name : ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Categorías
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {SCHEDULE_CATEGORIES.map((c) => (
                <div key={c.value} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{c.icon} {c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══ TAB: MATERIAS ═══ */}
      {tab === 'materias' && (
        <>
          {subjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>No tienes materias agregadas.</p>
              <p className="sub">Agrega tus materias para organizarte mejor.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {subjects.map((sub) => (
                <div key={sub.id} className="subject-card">
                  <div className="subject-color" style={{ background: sub.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
                      {sub.name}
                    </div>
                    {sub.professor && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        👨‍🏫 {sub.professor}
                      </div>
                    )}
                    {sub.room && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        📍 {sub.room}
                      </div>
                    )}
                  </div>
                  <button className="btn-ghost" onClick={() => handleDeleteSubject(sub.id)} title="Eliminar">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="btn-primary" onClick={() => setShowSubjectModal(true)}>
            + Agregar Materia
          </button>
        </>
      )}

      {/* ═══ TAB: EXÁMENES ═══ */}
      {tab === 'examenes' && (
        <>
          {sortedExams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No tienes exámenes programados.</p>
              <p className="sub">Agrega un examen para hacer seguimiento.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {sortedExams.map((exam) => {
                const sub = getSubjectById(exam.subjectId);
                const countdown = daysUntil(exam.date);
                const isPast = new Date(exam.date) < new Date(new Date().toDateString());
                return (
                  <div
                    key={exam.id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      opacity: isPast ? 0.5 : 1,
                      borderLeft: `3px solid ${sub?.color || 'var(--accent)'}`,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>
                        {exam.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {sub?.name || 'Sin materia'} · {exam.date}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: isPast ? 'var(--text-dim)' : countdown === 'Hoy' ? 'var(--accent)' : 'var(--green)',
                      whiteSpace: 'nowrap',
                    }}>
                      {countdown}
                    </div>
                    <button className="btn-ghost" onClick={() => {
                      if (window.confirm('¿Eliminar este examen?')) deleteExam(exam.id);
                    }}>
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={() => {
              setExamSubjectId(subjects[0]?.id || '');
              setShowExamModal(true);
            }}
          >
            + Agregar Examen
          </button>
        </>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Add Schedule Block */}
      {showBlockModal && selectedSlot && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBlockModal(false)}>
          <div className="modal-content">
            <h3>📌 Agregar Bloque</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
              {DAYS[selectedSlot.dayIdx]} a las {selectedSlot.hour}
            </p>

            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                placeholder="Ej: Matemáticas, Gym, Trabajo..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-input" value={blockCategory} onChange={(e) => setBlockCategory(e.target.value)}>
                {SCHEDULE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setShowBlockModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAddBlock}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSubjectModal(false)}>
          <div className="modal-content">
            <h3>📚 Nueva Materia</h3>

            <div className="form-group">
              <label className="form-label">Nombre de la materia</label>
              <input
                className="form-input"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Ej: Cálculo II"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profesor (opcional)</label>
              <input
                className="form-input"
                value={subProfessor}
                onChange={(e) => setSubProfessor(e.target.value)}
                placeholder="Ej: Prof. García"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Aula / Salón (opcional)</label>
              <input
                className="form-input"
                value={subRoom}
                onChange={(e) => setSubRoom(e.target.value)}
                placeholder="Ej: A-201"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSubColor(c)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: c,
                      border: subColor === c ? '3px solid white' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAddSubject}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exam */}
      {showExamModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowExamModal(false)}>
          <div className="modal-content">
            <h3>📝 Nuevo Examen</h3>

            <div className="form-group">
              <label className="form-label">Nombre del examen</label>
              <input
                className="form-input"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Ej: Parcial 1, Quiz 3..."
                autoFocus
              />
            </div>

            {subjects.length > 0 && (
              <div className="form-group">
                <label className="form-label">Materia</label>
                <select className="form-input" value={examSubjectId} onChange={(e) => setExamSubjectId(e.target.value)}>
                  <option value="">Sin materia</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-input"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>

            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setShowExamModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAddExam}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {notif && <div className="notification">{notif}</div>}
    </div>
  );
}
