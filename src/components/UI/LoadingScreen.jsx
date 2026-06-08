import { motion, AnimatePresence } from 'framer-motion';
import { loadingFadeVariants } from '../../animations/arenaAnimations.js';

export function LoadingScreen({ message = 'Loading arena...', progress = 0 }) {
  return (
    <motion.div
      className="loading-screen"
      variants={loadingFadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="pokeball" aria-hidden="true" />
      <p className="loading-screen__message">{message}</p>
      {progress > 0 && progress < 1 && (
        <div className="loading-screen__progress-bar">
          <div
            className="loading-screen__progress-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
