import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiChevronUp, HiChevronDown } from 'react-icons/hi2';

const exerciseSuggestions = {
  'Pecho': ['Bench Press', 'Incline Press', 'Dumbbell Flyes', 'Dips', 'Cable Crossover', 'Push Ups', 'Decline Press'],
  'Espalda': ['Pull Ups', 'Barbell Row', 'Lat Pulldown', 'Deadlift', 'Cable Row', 'T-Bar Row', 'Face Pull'],
  'Pierna': ['Squat', 'Leg Press', 'Lunges', 'Leg Curl', 'Leg Extension', 'Calf Raise', 'Romanian Deadlift', 'Hip Thrust', 'Bulgarian Split Squat'],
  'Hombro': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Arnold Press', 'Upright Row', 'Rear Delt Fly'],
  'Brazos': ['Bicep Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crusher', 'Preacher Curl', 'Cable Curl', 'Overhead Tricep Extension', 'Concentration Curl'],
  'Core': ['Plank', 'Crunches', 'Leg Raise', 'Russian Twist', 'Cable Crunch', 'Ab Wheel', 'Mountain Climbers', 'Dead Bug'],
};

const allExercises = Object.values(exerciseSuggestions).flat();
const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function GymSetup({ initial, units, onSave, onCancel }) {
  const [days, setDays] = useState(
    initial?.days || [
      { name: 'Push', dayOfWeek: 'Lunes', exercises: [] },
      { name: 'Pull', dayOfWeek: 'Miércoles', exercises: [] },
      { name: 'Pierna', dayOfWeek: 'Viernes', exercises: [] },
    ]
  );
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const addDay = () => {
    setDays([...days, { name: `Día ${days.length + 1}`, dayOfWeek: 'Lunes', exercises: [] }]);
    setSelectedDayIdx(days.length);
  };

  const removeDay = (idx) => {
    setDays(days.filter((_, i) => i !== idx));
    if (selectedDayIdx >= days.length - 1) setSelectedDayIdx(Math.max(0, days.length - 2));
  };

  const updateDay = (idx, field, value) => {
    const updated = [...days];
    updated[idx] = { ...updated[idx], [field]: value };
    setDays(updated);
  };

  const addExercise = (dayIdx, name) => {
    const updated = [...days];
    updated[dayIdx].exercises.push({
      name: name || 'Nuevo ejercicio',
      defaultSets: 3,
      defaultReps: 10,
      currentWeight: 0,
    });
    setDays(updated);
    setSearchTerm('');
  };

  const updateExercise = (dayIdx, exIdx, field, value) => {
    const updated = [...days];
    updated[dayIdx].exercises[exIdx] = { ...updated[dayIdx].exercises[exIdx], [field]: value };
    setDays(updated);
  };

  const removeExercise = (dayIdx, exIdx) => {
    const updated = [...days];
    updated[dayIdx].exercises = updated[dayIdx].exercises.filter((_, i) => i !== exIdx);
    setDays(updated);
  };

  const moveExercise = (dayIdx, exIdx, dir) => {
    const updated = [...days];
    const exercises = [...updated[dayIdx].exercises];
    const newIdx = exIdx + dir;
    if (newIdx < 0 || newIdx >= exercises.length) return;
    [exercises[exIdx], exercises[newIdx]] = [exercises[newIdx], exercises[exIdx]];
    updated[dayIdx].exercises = exercises;
    setDays(updated);
  };

  const filteredSuggestions = searchTerm
    ? allExercises.filter((e) => e.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const currentDay = days[selectedDayIdx];

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-text-primary">
          {initial ? 'Editar Rutina' : 'Crear Rutina'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-text-muted">← Volver</button>
        )}
      </div>

      {/* Day tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDayIdx(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDayIdx === i ? 'bg-accent text-white' : 'bg-bg-surface text-text-secondary'
            }`}
          >
            {day.name}
          </button>
        ))}
        <button onClick={addDay} className="flex-shrink-0 px-2 py-1.5 rounded-lg text-xs text-accent bg-accent/10">
          <HiPlus className="w-3 h-3" />
        </button>
      </div>

      {currentDay && (
        <div className="glass-card p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Nombre</label>
              <input
                type="text"
                value={currentDay.name}
                onChange={(e) => updateDay(selectedDayIdx, 'name', e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Día de la semana</label>
              <select
                value={currentDay.dayOfWeek}
                onChange={(e) => updateDay(selectedDayIdx, 'dayOfWeek', e.target.value)}
                className="text-sm"
              >
                {dayNames.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercises */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">Ejercicios</label>
            {currentDay.exercises.map((ex, i) => (
              <div key={i} className="bg-bg-deep rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => updateExercise(selectedDayIdx, i, 'name', e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <button onClick={() => moveExercise(selectedDayIdx, i, -1)} className="text-text-muted p-0.5">
                    <HiChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveExercise(selectedDayIdx, i, 1)} className="text-text-muted p-0.5">
                    <HiChevronDown className="w-3 h-3" />
                  </button>
                  <button onClick={() => removeExercise(selectedDayIdx, i)} className="text-red p-0.5">
                    <HiTrash className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-text-muted">Series</label>
                    <input
                      type="number"
                      value={ex.defaultSets}
                      onChange={(e) => updateExercise(selectedDayIdx, i, 'defaultSets', parseInt(e.target.value) || 1)}
                      className="text-xs"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted">Reps</label>
                    <input
                      type="number"
                      value={ex.defaultReps}
                      onChange={(e) => updateExercise(selectedDayIdx, i, 'defaultReps', parseInt(e.target.value) || 1)}
                      className="text-xs"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted">Peso ({units})</label>
                    <input
                      type="number"
                      value={ex.currentWeight}
                      onChange={(e) => updateExercise(selectedDayIdx, i, 'currentWeight', parseFloat(e.target.value) || 0)}
                      className="text-xs"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add exercise */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar o agregar ejercicio..."
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    addExercise(selectedDayIdx, searchTerm.trim());
                  }
                }}
              />
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-bg-card border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                  {filteredSuggestions.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      onClick={() => addExercise(selectedDayIdx, s)}
                      className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-accent/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {days.length > 1 && (
            <button
              onClick={() => removeDay(selectedDayIdx)}
              className="text-xs text-red hover:text-red/80 transition-colors self-start"
            >
              Eliminar este día
            </button>
          )}
        </div>
      )}

      <button onClick={() => onSave({ days })} className="btn-primary">
        Guardar rutina
      </button>
    </div>
  );
}
