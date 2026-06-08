import { motion } from 'framer-motion';
import { typeToGradient } from '../../utils/typeColors.js';
import { bgTransitionConfig } from '../../animations/arenaAnimations.js';

export function ArenaBackground({ leftType, rightType }) {
  return (
    <div className="arena-bg" aria-hidden="true">
      <motion.div
        className={`arena-bg__half particles-${leftType ?? 'normal'}`}
        animate={{ backgroundColor: typeToGradient(leftType, 0.28) }}
        transition={bgTransitionConfig}
      />
      <motion.div
        className={`arena-bg__half particles-${rightType ?? 'normal'}`}
        animate={{ backgroundColor: typeToGradient(rightType, 0.28) }}
        transition={bgTransitionConfig}
      />
    </div>
  );
}
