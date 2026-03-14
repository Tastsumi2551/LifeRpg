import { motion } from 'framer-motion';

export default function StepHealth({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h2 className="font-display text-xl font-bold text-text-primary mb-1">Metas de Salud</h2>
        <p className="text-text-muted text-sm">Personaliza tus objetivos</p>
      </div>

      {/* Gym */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">🏋️ ¿Vas al gym?</span>
          <div
            onClick={() => update('goesToGym', !data.goesToGym)}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
              data.goesToGym ? 'bg-accent' : 'bg-bg-deep'
            }`}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full absolute top-0.5"
              animate={{ left: data.goesToGym ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </div>

        {data.goesToGym && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-3 pt-2 border-t border-border"
          >
            <div>
              <label className="text-xs text-text-muted mb-1 block">Días por semana</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    onClick={() => update('gymDays', n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      data.gymDays === n
                        ? 'bg-accent text-white'
                        : 'bg-bg-deep text-text-muted hover:bg-bg-surface'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Horario preferido</label>
              <div className="flex gap-2">
                {['mañana', 'tarde', 'noche'].map((t) => (
                  <button
                    key={t}
                    onClick={() => update('gymPreference', t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                      data.gymPreference === t
                        ? 'bg-accent text-white'
                        : 'bg-bg-deep text-text-muted hover:bg-bg-surface'
                    }`}
                  >
                    {t === 'mañana' ? '🌅' : t === 'tarde' ? '☀️' : '🌙'} {t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Nutrition */}
      <div className="glass-card p-4 flex flex-col gap-4">
        <span className="text-sm font-medium">🍽️ Nutrición</span>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Meta de calorías diarias</label>
          <input
            type="number"
            value={data.calorieGoal}
            onChange={(e) => update('calorieGoal', parseInt(e.target.value) || 0)}
            min={1000}
            max={5000}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Meta de proteína (g)</label>
          <input
            type="number"
            value={data.proteinGoal}
            onChange={(e) => update('proteinGoal', parseInt(e.target.value) || 0)}
            min={30}
            max={400}
          />
        </div>
      </div>

      {/* Hydration */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <span className="text-sm font-medium">💧 Hidratación</span>
        <div>
          <label className="text-xs text-text-muted mb-2 block">
            Vasos de agua por día: <span className="text-accent font-mono">{data.waterGoal}</span>
          </label>
          <input
            type="range"
            min={4}
            max={15}
            value={data.waterGoal}
            onChange={(e) => update('waterGoal', parseInt(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>4</span>
            <span>15</span>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <span className="text-sm font-medium">⚖️ Peso (opcional)</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Peso actual (kg)</label>
            <input
              type="number"
              value={data.currentWeight}
              onChange={(e) => update('currentWeight', e.target.value)}
              placeholder="70"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Peso meta (kg)</label>
            <input
              type="number"
              value={data.goalWeight}
              onChange={(e) => update('goalWeight', e.target.value)}
              placeholder="65"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
