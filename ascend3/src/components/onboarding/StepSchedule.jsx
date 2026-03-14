import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiTrash } from 'react-icons/hi2';

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const categories = [
  { value: 'trabajo', icon: '💼', label: 'Trabajo' },
  { value: 'estudio', icon: '📚', label: 'Estudio' },
  { value: 'gym', icon: '🏋️', label: 'Gym' },
  { value: 'comida', icon: '🍽️', label: 'Comida' },
  { value: 'libre', icon: '🎮', label: 'Libre' },
  { value: 'descanso', icon: '🧘', label: 'Descanso' },
  { value: 'otro', icon: '🔧', label: 'Otro' },
];

export default function StepSchedule({ data, onChange }) {
  const [selectedDay, setSelectedDay] = useState('Lunes');

  const updateDay = (day, field, value) => {
    onChange({ ...data, [day]: { ...data[day], [field]: value } });
  };

  const addBlock = (day) => {
    const blocks = [...(data[day].blocks || [])];
    blocks.push({ name: '', start: '09:00', end: '10:00', category: 'otro' });
    updateDay(day, 'blocks', blocks);
  };

  const updateBlock = (day, index, field, value) => {
    const blocks = [...data[day].blocks];
    blocks[index] = { ...blocks[index], [field]: value };
    updateDay(day, 'blocks', blocks);
  };

  const removeBlock = (day, index) => {
    const blocks = data[day].blocks.filter((_, i) => i !== index);
    updateDay(day, 'blocks', blocks);
  };

  const copyToWeekdays = () => {
    const mondayData = data['Lunes'];
    const updated = { ...data };
    ['Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach((day) => {
      updated[day] = { ...JSON.parse(JSON.stringify(mondayData)) };
    });
    onChange(updated);
  };

  const dayData = data[selectedDay];

  return (
    <div className="flex flex-col gap-4 py-4">
      <div>
        <h2 className="font-display text-xl font-bold text-text-primary mb-1">Tu Horario</h2>
        <p className="text-text-muted text-sm">Define tu rutina semanal</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDay === day
                ? 'bg-accent text-white'
                : data[day].active
                ? 'bg-bg-surface text-text-secondary hover:bg-bg-card'
                : 'bg-bg-surface/50 text-text-muted'
            }`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Copy shortcut */}
      <button
        onClick={copyToWeekdays}
        className="text-xs text-cyan hover:text-cyan/80 transition-colors text-left"
      >
        📋 Copiar Lunes a días de semana
      </button>

      {/* Day config */}
      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{selectedDay}</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-text-muted">Activo</span>
            <div
              onClick={() => updateDay(selectedDay, 'active', !dayData.active)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                dayData.active ? 'bg-accent' : 'bg-bg-deep'
              }`}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                animate={{ left: dayData.active ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </label>
        </div>

        {dayData.active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Despertar</label>
                <input
                  type="time"
                  value={dayData.wakeUp}
                  onChange={(e) => updateDay(selectedDay, 'wakeUp', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Dormir</label>
                <input
                  type="time"
                  value={dayData.sleep}
                  onChange={(e) => updateDay(selectedDay, 'sleep', e.target.value)}
                />
              </div>
            </div>

            {/* Blocks */}
            <div>
              <label className="text-xs text-text-muted mb-2 block">Bloques de actividad</label>
              <AnimatePresence>
                {(dayData.blocks || []).map((block, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-bg-deep rounded-lg p-3 mb-2 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={block.name}
                        onChange={(e) => updateBlock(selectedDay, i, 'name', e.target.value)}
                        placeholder="Nombre del bloque"
                        className="flex-1 text-sm"
                      />
                      <button
                        onClick={() => removeBlock(selectedDay, i)}
                        className="text-red hover:text-red/80 p-1"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="time"
                        value={block.start}
                        onChange={(e) => updateBlock(selectedDay, i, 'start', e.target.value)}
                        className="text-xs"
                      />
                      <input
                        type="time"
                        value={block.end}
                        onChange={(e) => updateBlock(selectedDay, i, 'end', e.target.value)}
                        className="text-xs"
                      />
                      <select
                        value={block.category}
                        onChange={(e) => updateBlock(selectedDay, i, 'category', e.target.value)}
                        className="text-xs"
                      >
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.icon} {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                onClick={() => addBlock(selectedDay)}
                className="flex items-center gap-1 text-accent text-xs hover:text-accent2 transition-colors mt-1"
              >
                <HiPlus className="w-3 h-3" /> Agregar bloque
              </button>
            </div>

            {/* Mini timeline preview */}
            {dayData.blocks?.length > 0 && (
              <div>
                <label className="text-xs text-text-muted mb-2 block">Vista previa</label>
                <div className="bg-bg-deep rounded-lg p-2 flex gap-1 overflow-x-auto">
                  {dayData.blocks
                    .filter((b) => b.name)
                    .sort((a, b) => a.start.localeCompare(b.start))
                    .map((block, i) => {
                      const cat = categories.find((c) => c.value === block.category);
                      return (
                        <div
                          key={i}
                          className="flex-shrink-0 bg-accent/10 border border-accent/20 rounded px-2 py-1 text-[10px]"
                        >
                          <span>{cat?.icon} </span>
                          <span className="text-text-secondary">{block.name}</span>
                          <div className="text-text-muted">{block.start}-{block.end}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
