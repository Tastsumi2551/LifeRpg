import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';

const presets = [
  { label: '25 min', seconds: 25 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
];

export default function PomodoroTimer({ compact = false }) {
  const { addXP } = useGameStore();
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pomodorosToday, setPomodorosToday] = useState(0);
  const [label, setLabel] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setPomodorosToday((p) => p + 1);
          addXP(15);

          // Play sound
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch {}

          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, addXP]);

  const start = () => {
    if (remaining === 0) setRemaining(duration);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  if (compact) {
    return (
      <div className="glass-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <div>
              <span className="text-sm font-mono font-bold text-text-primary">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              {pomodorosToday > 0 && (
                <span className="text-[10px] text-text-muted ml-2">🍅 {pomodorosToday}</span>
              )}
            </div>
          </div>
          <button
            onClick={running ? pause : start}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              running ? 'bg-red/10 text-red' : 'bg-accent/10 text-accent'
            }`}
          >
            {running ? 'Pausar' : remaining === duration ? 'Iniciar' : 'Continuar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 flex flex-col items-center gap-4">
      <h3 className="text-sm font-display font-bold text-text-primary">⏱️ Pomodoro</h3>

      {/* Timer circle */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90">
          <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
          <circle
            cx="64" cy="64" r="56" fill="none" stroke="#6366f1" strokeWidth="8"
            strokeDasharray={`${progress * 3.518} 351.8`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold text-text-primary">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Presets */}
      {!running && (
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => { setDuration(p.seconds); setRemaining(p.seconds); }}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                duration === p.seconds ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Label */}
      {!running && (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="¿Qué vas a hacer?"
          className="text-sm text-center"
        />
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={running ? pause : start}
          className="btn-primary text-sm py-2 px-6"
        >
          {running ? '⏸ Pausar' : remaining === duration ? '▶ Iniciar' : '▶ Continuar'}
        </button>
        {remaining !== duration && (
          <button onClick={reset} className="py-2 px-4 text-sm text-text-muted hover:text-text-primary rounded-xl">
            ↻ Reset
          </button>
        )}
      </div>

      {pomodorosToday > 0 && (
        <p className="text-xs text-text-muted">🍅 {pomodorosToday} pomodoros hoy</p>
      )}
    </div>
  );
}
