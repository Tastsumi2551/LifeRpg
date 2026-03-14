import { motion } from 'framer-motion';

export default function XPBar({ level, xp }) {
  const xpNeeded = level * 100;
  const progress = Math.min((xp / xpNeeded) * 100, 100);
  const isClose = progress > 80;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono font-semibold text-accent">Lv.{level}</span>
      <div className={`w-20 h-2 rounded-full bg-bg-deep overflow-hidden ${isClose ? 'animate-pulse-glow' : ''}`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-mono text-text-muted">
        {xp}/{xpNeeded}
      </span>
    </div>
  );
}
