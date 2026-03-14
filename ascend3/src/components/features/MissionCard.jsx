import { motion } from 'framer-motion';

const categoryColors = {
  gym: 'border-green/30 bg-green/5',
  estudio: 'border-cyan/30 bg-cyan/5',
  nutrición: 'border-gold/30 bg-gold/5',
  hidratación: 'border-cyan/30 bg-cyan/5',
  finanzas: 'border-gold/30 bg-gold/5',
  personal: 'border-accent/30 bg-accent/5',
  trabajo: 'border-accent2/30 bg-accent2/5',
  bonus: 'border-gold/30 bg-gold/5',
};

export default function MissionCard({ mission, onComplete, completed }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`glass-card p-3 flex items-center gap-3 border ${
        completed
          ? 'opacity-50 border-green/20'
          : categoryColors[mission.category] || 'border-border'
      }`}
    >
      {/* Complete button */}
      {!completed ? (
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => onComplete?.(mission.id)}
          className="w-6 h-6 rounded-full border-2 border-accent/40 flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-all flex-shrink-0"
        >
        </motion.button>
      ) : (
        <div className="w-6 h-6 rounded-full bg-green flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs">✓</span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">{mission.icon}</span>
          <span className={`text-sm font-medium truncate ${completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {mission.name}
          </span>
        </div>
        {mission.suggestedTime && (
          <span className="text-[10px] text-text-muted font-mono">⏰ {mission.suggestedTime}</span>
        )}
      </div>

      {/* XP */}
      <span className={`text-xs font-mono flex-shrink-0 ${completed ? 'text-green' : 'text-accent'}`}>
        +{mission.xp} XP
      </span>
    </motion.div>
  );
}
