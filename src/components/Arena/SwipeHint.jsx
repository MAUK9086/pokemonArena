import { motion } from 'framer-motion';
import { swipeHintVariants } from '../../animations/arenaAnimations.js';

export function SwipeHint() {
  return (
    <motion.p
      className="swipe-hint"
      variants={swipeHintVariants}
      initial="idle"
      animate="wiggle"
    >
      ← tap or swipe to choose →
    </motion.p>
  );
}
