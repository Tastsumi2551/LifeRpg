import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore, SKILL_OPTIONS, POMODORO_XP } from '../stores/gameStore';

// ══════════════════════════════════════════════════════
// POMODORO TIMER
// ══════════════════════════════════════════════════════

function PomodoroTimer() {
  const { completePomodoroSession, pomodoroSessions, pomodoroTotalMinutes } = useGameStore();

  const [duration, setDuration] = useState(25);
  const [skill, setSkill] = useState('estudios');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);

  const totalSeconds = duration * 60;
  const progress = 1 - timeLeft / totalSeconds;
  const circumference = 2 * Math.PI * 95;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const start = () => {
    if (isComplete) {
      setTimeLeft(duration * 60);
      setIsComplete(false);
    }
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft(duration * 60);
  };

  const changeDuration = (mins) => {
    if (isRunning) return;
    setDuration(mins);
    setTimeLeft(mins * 60);
    setIsComplete(false);
  };

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        setIsComplete(true);
        completePomodoroSession(duration, skill);
        return 0;
      }
      return prev - 1;
    });
  }, [completePomodoroSession, duration, skill]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, tick]);

  return (
    <div>
      {/* Duration selector */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {[25, 45, 60].map((m) => (
          <button
            key={m}
            className={`tab-btn ${duration === m ? 'active' : ''}`}
            onClick={() => changeDuration(m)}
            style={{ minWidth: 60 }}
          >
            {m} min
          </button>
        ))}
      </div>

      {/* Skill selector */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <select
          className="form-input"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.82rem' }}
          disabled={isRunning}
        >
          {SKILL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Timer Ring */}
      <div className="pomodoro-ring" style={{ marginBottom: 24 }}>
        <svg viewBox="0 0 200 200">
          <circle className="track" cx="100" cy="100" r="95" />
          <circle
            className="progress"
            cx="100" cy="100" r="95"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ stroke: isComplete ? 'var(--green)' : 'var(--accent)' }}
          />
        </svg>
        <div className="pomodoro-center">
          <div className="pomodoro-time">{formatTime(timeLeft)}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
            +{POMODORO_XP[duration] || 15} XP · +{Math.floor(duration / 5)} 🪙
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
        {!isRunning ? (
          <button className="btn-primary" onClick={start} style={{ width: 'auto', minWidth: 120 }}>
            {isComplete ? 'Otra vez' : timeLeft < totalSeconds ? 'Continuar' : 'Iniciar'}
          </button>
        ) : (
          <button className="btn-secondary" onClick={pause} style={{ minWidth: 120 }}>
            Pausar
          </button>
        )}
        {(isRunning || timeLeft < totalSeconds) && (
          <button className="btn-ghost" onClick={reset} style={{ fontSize: '0.85rem' }}>
            Reiniciar
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{pomodoroSessions}</div>
          <div className="stat-label">Sesiones</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--purple)' }}>
            {pomodoroTotalMinutes >= 60
              ? `${Math.floor(pomodoroTotalMinutes / 60)}h ${pomodoroTotalMinutes % 60}m`
              : `${pomodoroTotalMinutes}m`
            }
          </div>
          <div className="stat-label">Tiempo total</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// BATTLE (Bad Habits)
// ══════════════════════════════════════════════════════

function Battle() {
  const { badHabits, skills, addBadHabit, reportRelapse, deleteBadHabit } = useGameStore();
  const [showModal, setShowModal] = useState(false);

  // Form
  const [habitName, setHabitName] = useState('');
  const [penalty, setPenalty] = useState(100);
  const [affectedSkill, setAffectedSkill] = useState('mentalidad');

  const handleAdd = () => {
    if (!habitName.trim()) return;
    addBadHabit({ name: habitName.trim(), penalty, affectedSkill });
    setHabitName('');
    setPenalty(100);
    setAffectedSkill('mentalidad');
    setShowModal(false);
  };

  const handleRelapse = (i) => {
    const habit = badHabits[i];
    if (window.confirm(`Reportar recaida? Perderas ${habit.penalty} XP.`)) {
      reportRelapse(i);
    }
  };

  const handleDelete = (i) => {
    if (window.confirm('Eliminar este habito?')) {
      deleteBadHabit(i);
    }
  };

  const totalCleanDays = badHabits.reduce((s, h) => s + h.cleanDays, 0);
  const maxClean = badHabits.reduce((m, h) => Math.max(m, h.cleanDays), 0);

  return (
    <div>
      {/* Summary Stats */}
      {badHabits.length > 0 && (
        <div className="grid-stats" style={{ marginBottom: 22, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--green)' }}>{badHabits.length}</div>
            <div className="stat-label">Habitos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--green)' }}>{totalCleanDays}</div>
            <div className="stat-label">Dias limpios</div>
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
          <p>No tienes habitos a romper.</p>
          <p className="sub">Agrega un habito para empezar tu batalla.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {badHabits.map((habit, i) => (
            <div
              key={habit.createdAt || i}
              className={`habit-card ${habit.cleanDays >= 7 ? 'clean' : ''}`}
            >
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
                  {habit.cleanDays} dias
                </div>
              </div>

              <div style={{
                fontSize: '0.82rem', color: 'var(--text-secondary)',
                marginBottom: 14, display: 'flex', justifyContent: 'space-between',
              }}>
                <span>Afecta: {skills[habit.affectedSkill]?.icon} {skills[habit.affectedSkill]?.name}</span>
                <span style={{ color: '#ef4444' }}>-{habit.penalty} XP</span>
              </div>

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

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-danger" onClick={() => handleRelapse(i)}>
                  Reportar Recaida
                </button>
                <button className="btn-ghost" onClick={() => handleDelete(i)} style={{ fontSize: '0.82rem' }}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={() => setShowModal(true)}>
        + Agregar Habito a Romper
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>Nuevo Habito a Romper</h3>

            <div className="form-group">
              <label className="form-label">Nombre del habito</label>
              <input
                className="form-input"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Ej: Scrolling, Procrastinacion..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Penalizacion (XP a perder si recaes)</label>
              <select className="form-input" value={penalty} onChange={(e) => setPenalty(Number(e.target.value))}>
                <option value={50}>-50 XP (Leve)</option>
                <option value={100}>-100 XP (Moderada)</option>
                <option value={200}>-200 XP (Severa)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Area mas afectada</label>
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
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ARSENAL PAGE (combines both)
// ══════════════════════════════════════════════════════

export default function Arsenal() {
  const [tab, setTab] = useState('pomodoro');

  return (
    <div>
      <div className="page-header">
        <h1>Arsenal</h1>
        <p>Herramientas de productividad y disciplina</p>
      </div>

      <div className="tab-group">
        <button
          className={`tab-btn ${tab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setTab('pomodoro')}
        >
          Pomodoro
        </button>
        <button
          className={`tab-btn ${tab === 'battle' ? 'active' : ''}`}
          onClick={() => setTab('battle')}
        >
          Anti-Dopamina
        </button>
      </div>

      {tab === 'pomodoro' && <PomodoroTimer />}
      {tab === 'battle' && <Battle />}
    </div>
  );
}
