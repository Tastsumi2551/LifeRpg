import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash } from 'react-icons/hi2';

export default function StepMissions({ data, onChange, schedule, health }) {
  const [customName, setCustomName] = useState('');

  const hasGymBlocks = Object.values(schedule || {}).some(
    (day) => day.active && day.blocks?.some((b) => b.category === 'gym')
  );
  const hasStudyBlocks = Object.values(schedule || {}).some(
    (day) => day.active && day.blocks?.some((b) => b.category === 'estudio')
  );
  const goesToGym = health?.goesToGym || hasGymBlocks;

  const sleepTime = Object.values(schedule || {}).find((d) => d.active)?.sleep || '23:00';

  const suggestedMissions = [
    ...(goesToGym ? [{ id: 'gym', name: 'Ir al gym', icon: '🏋️', xp: 50 }] : []),
    ...(hasStudyBlocks ? [{ id: 'study', name: 'Estudiar (sesión completa)', icon: '📚', xp: 40 }] : []),
    { id: 'water', name: `Tomar ${health?.waterGoal || 8} vasos de agua`, icon: '💧', xp: 15 },
    { id: 'nutrition', name: 'Comer dentro de mis macros', icon: '🍽️', xp: 25 },
    { id: 'pomodoro', name: 'Completar un pomodoro de 25min', icon: '⏱️', xp: 20 },
    { id: 'walk', name: 'Caminar 30 minutos', icon: '🚶', xp: 20 },
    { id: 'read', name: 'Leer 20 páginas', icon: '📖', xp: 25 },
    { id: 'meditate', name: 'Meditar 10 minutos', icon: '🧘', xp: 15 },
    { id: 'save', name: 'Ahorrar hoy (no gastar innecesario)', icon: '💰', xp: 20 },
    { id: 'sleep', name: `Dormir antes de las ${sleepTime}`, icon: '😴', xp: 30 },
  ];

  const toggleMission = (id) => {
    const active = [...data.activeMissions];
    const idx = active.indexOf(id);
    if (idx >= 0) active.splice(idx, 1);
    else active.push(id);
    onChange({ ...data, activeMissions: active });
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const custom = [...data.customMissions, { name: customName.trim(), xp: 25 }];
    onChange({ ...data, customMissions: custom });
    setCustomName('');
  };

  const removeCustom = (index) => {
    const custom = data.customMissions.filter((_, i) => i !== index);
    onChange({ ...data, customMissions: custom });
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h2 className="font-display text-xl font-bold text-text-primary mb-1">Tus Misiones</h2>
        <p className="text-text-muted text-sm">
          Ascend genera misiones diarias basadas en tu horario. Elige cuáles quieres.
        </p>
      </div>

      {/* Suggested */}
      <div className="flex flex-col gap-2">
        {suggestedMissions.map((mission) => {
          const isActive = data.activeMissions.includes(mission.id);
          return (
            <motion.button
              key={mission.id}
              onClick={() => toggleMission(mission.id)}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-accent/15 border border-accent/30'
                  : 'bg-bg-surface border border-transparent hover:border-border'
              }`}
            >
              <span className="text-xl">{mission.icon}</span>
              <span className="flex-1 text-sm text-text-primary">{mission.name}</span>
              <span className="text-xs font-mono text-accent">+{mission.xp} XP</span>
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isActive ? 'bg-accent border-accent' : 'border-text-muted'
                }`}
              >
                {isActive && <span className="text-white text-xs">✓</span>}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Custom */}
      <div>
        <label className="text-text-secondary text-sm mb-2 block">Misiones personalizadas</label>
        {data.customMissions.map((m, i) => (
          <div key={i} className="flex items-center gap-2 mb-2 bg-bg-surface rounded-lg p-2">
            <span className="text-sm text-text-primary flex-1">⚡ {m.name}</span>
            <button onClick={() => removeCustom(i)} className="text-red p-1">
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nombre de la misión"
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            className="flex-1 text-sm"
          />
          <button
            onClick={addCustom}
            className="btn-primary py-2 px-3 text-sm"
          >
            <HiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
