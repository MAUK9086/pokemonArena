import { motion } from 'framer-motion';
import { resultCardItemVariants } from '../../animations/arenaAnimations.js';

export function ArchetypeBadge({ archetype }) {
  if (!archetype) return null;
  return (
    <motion.div
      className="archetype-badge"
      variants={resultCardItemVariants}
      style={{ borderTopColor: archetype.color }}
    >
      <span className="archetype-badge__label" style={{ color: archetype.color }}>
        {archetype.label}
      </span>
      <span className="archetype-badge__desc">{archetype.description}</span>
    </motion.div>
  );
}
