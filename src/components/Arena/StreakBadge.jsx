import { motion, AnimatePresence } from 'framer-motion';
import { streakBadgeVariants } from '../../animations/arenaAnimations.js';

export function StreakBadge({ streak, name }) {
  if (!streak || streak < 1) return null;
  const flames = '🔥'.repeat(streak);

  return (
    <AnimatePresence>
      <motion.div
        key={`streak-${streak}`}
        className="streak-badge"
        variants={streakBadgeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <span className="streak-badge__flames">{flames}</span>
        <span className="streak-badge__name">{name}</span>
        <span className="streak-badge__label">{streak} WIN STREAK</span>
      </motion.div>
    </AnimatePresence>
  );
}
