import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash } from 'react-icons/hi2';

const getSuggestedMissions = (schedule, health) => {
  const missions = [];

  if (health.goesToGym) {
    missions.push({ id: 'gym', name: 'Ir al gym', icon: '🏋️', category: 'gym' });
  }

  const hasStudyBlocks = Object.values(schedule).some((d) =>
    d.blocks?.some((b) => b.category === 'estudio')
  );
  if (hasStudyBlocks) {
    missions.push({ id: 'study', name: 'Estudiar X horas', icon: '📚', category: 'estudio' });
  }

  missions.push(
    { id: 'water', name: `Tomar ${health.waterGoal} vasos de agua`, icon: '💧', category: 'hidratacion' },
    { id: 'macros', name: 'Comer dentro de mis macros', icon: '🍽️', category: 'nutricion' },
    { id: 'pomodoro', name: 'Completar un pomodoro de 25min', icon: '🍅', category: 'productividad' },
    { id: 'walk', name: 'Caminar 30 minutos', icon: '🚶', category: 'salud' },
    { id: 'read', name: 'Leer 20 páginas', icon: '📖', category: 'personal' },
    { id: 'meditate', name: 'Meditar 10 minutos', icon: '🧘', category: 'personal' },
    { id: 'save', name: 'Ahorrar hoy (no gastar innecesario)', icon: '💰', category: 'finanzas' },
  );

  const sleepTime = Object.values(schedule).find((d) => d.active)?.sleep;
  if (sleepTime) {
    missions.push({ id: 'sleep', name: `Dormir antes de las ${sleepTime}`, icon: '😴', category: 'salud' });
  }

  return missions;
};

export default function StepMissions({ data, onChange, schedule, health }) {
  const [customName, setCustomName] = useState('');
  const suggested = getSuggestedMissions(schedule, health);

  const toggleMission = (id) => {
    const active = [...data.activeMissions];
    const idx = active.indexOf(id);
    if (idx >= 0) {
      active.splice(idx, 1);
    } else {
      active.push(id);
    }
    onChange({ ...data, activeMissions: active });
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const custom = [...data.customMissions, { id: `custom_${Date.now()}`, name: customName.trim(), icon: '⚡' }];
    onChange({ ...data, customMissions: custom });
    setCustomName('');
  };

  const removeCustom = (id) => {
    onChange({ ...data, customMissions: data.customMissions.filter((m) => m.id !== id) });
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h2 className="font-display text-xl font-bold text-text-primary mb-1">Tus Misiones</h2>
        <p className="text-text-muted text-sm">
          Ascend genera misiones diarias basadas en tu horario. Elige las que quieras.
        </p>
      </div>

      {/* Suggested */}
      <div className="flex flex-col gap-2">
        {suggested.map((mission) => {
          const isActive = data.activeMissions.includes(mission.id);
          return (
            <motion.button
              key={mission.id}
              onClick={() => toggleMission(mission.id)}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                isActive
                  ? 'bg-accent/15 border border-accent/30'
                  : 'bg-bg-surface border border-transparent hover:border-border'
              }`}
            >
              <span className="text-xl">{mission.icon}</span>
              <span className="text-sm flex-1">{mission.name}</span>
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

      {/* Custom missions */}
      <div>
        <label className="text-text-secondary text-sm mb-2 block">Misiones personalizadas</label>
        {data.customMissions.map((m) => (
          <div key={m.id} className="flex items-center gap-2 bg-bg-surface rounded-lg p-2 mb-2">
            <span>⚡</span>
            <span className="text-sm flex-1">{m.name}</span>
            <button onClick={() => removeCustom(m.id)} className="text-red hover:text-red/80 p-1">
              <HiTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nombre de misión..."
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          />
          <button onClick={addCustom} className="btn-primary text-sm py-2 px-3">
            <HiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
