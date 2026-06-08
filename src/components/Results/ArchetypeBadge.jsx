import { motion } from 'framer-motion';
import { resultCardItemVariants } from '../../animations/arenaAnimations.js';

export function ArchetypeBadge({ archetype }) {
  if (!archetype) return null;
  return (
    <motion.div className="archetype-badge" variants={resultCardItemVariants}>
      <span className="archetype-badge__icon">{archetype.icon}</span>
      <span className="archetype-badge__label">{archetype.label}</span>
      <span className="archetype-badge__desc">{archetype.description}</span>
    </motion.div>
  );
}
