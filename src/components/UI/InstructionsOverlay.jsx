import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'pokemon_arena_seen_instructions';

export function InstructionsOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="instructions-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="instructions-card"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.05 }}
          >
            <h2 className="instructions-card__title">How to play</h2>

            <ol className="instructions-card__steps">
              <li className="instructions-card__step">
                <span className="instructions-card__num">1</span>
                <div>
                  <strong>Read the question</strong> at the top — it changes every day.
                </div>
              </li>
              <li className="instructions-card__step">
                <span className="instructions-card__num">2</span>
                <div>
                  <strong>Tap the Pokemon</strong> that fits the question better. You get 10 matchups.
                </div>
              </li>
              <li className="instructions-card__step">
                <span className="instructions-card__num">3</span>
                <div>
                  <strong>See your results</strong> — your champion, your archetype, and how the world voted.
                </div>
              </li>
            </ol>

            <button className="btn btn--primary instructions-card__cta" onClick={dismiss}>
              Start Playing
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
