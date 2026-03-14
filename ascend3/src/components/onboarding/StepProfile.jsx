import { motion } from 'framer-motion';

const avatars = ['🧑‍💻', '👩‍🎓', '🧑‍🏫', '💪', '🎮', '🧠', '🚀', '🐉', '⚡', '🔥'];

export default function StepProfile({ data, onChange }) {
  const timezones = Intl.supportedValuesOf('timeZone');

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h2 className="font-display text-xl font-bold text-text-primary mb-1">Tu Perfil</h2>
        <p className="text-text-muted text-sm">¿Cómo te llamamos?</p>
      </div>

      <div>
        <label className="text-text-secondary text-sm mb-2 block">Nombre</label>
        <input
          type="text"
          value={data.displayName}
          onChange={(e) => onChange({ ...data, displayName: e.target.value })}
          placeholder="Tu nombre"
          maxLength={30}
        />
      </div>

      <div>
        <label className="text-text-secondary text-sm mb-3 block">Avatar</label>
        <div className="grid grid-cols-5 gap-3">
          {avatars.map((avatar) => (
            <motion.button
              key={avatar}
              onClick={() => onChange({ ...data, avatar })}
              whileTap={{ scale: 0.9 }}
              className={`text-3xl p-3 rounded-xl transition-all ${
                data.avatar === avatar
                  ? 'bg-accent/20 border-2 border-accent shadow-lg shadow-accent/20'
                  : 'bg-bg-surface border-2 border-transparent hover:border-border-bright'
              }`}
            >
              {avatar}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-text-secondary text-sm mb-2 block">Zona horaria</label>
        <select
          value={data.timezone}
          onChange={(e) => onChange({ ...data, timezone: e.target.value })}
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
