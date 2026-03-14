import { motion } from 'framer-motion';

export default function StepAxel({ name }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-8xl"
      >
        🥚
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3"
      >
        <h2 className="font-display text-2xl font-bold text-text-primary">
          Conoce a Axel
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
          Este es Axel. Es tu compañero de vida. Crece contigo a medida que subes de nivel.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-4 max-w-xs"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">🐉</span>
          <div className="bg-accent/10 rounded-xl rounded-tl-none p-3 text-sm text-text-secondary text-left">
            ¡Hola{name ? ` ${name}` : ''}! Estoy listo para crecer juntos. ¡Vamos a esto! 🔥
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-text-muted text-xs"
      >
        Axel evolucionará a medida que subas de nivel
      </motion.p>
    </div>
  );
}
