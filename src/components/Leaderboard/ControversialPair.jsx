import { motion } from 'framer-motion';
import { leaderboardRowVariants } from '../../animations/arenaAnimations.js';

export function ControversialPair({ data, pokemonName, index }) {
  const total = data.wins + data.losses;
  const winPct = total > 0 ? ((data.wins / total) * 100).toFixed(1) : '0.0';

  return (
    <motion.div
      className="controversial-item"
      variants={leaderboardRowVariants}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <span className="controversial-item__name">
        {pokemonName || `#${data.pokemon_id}`}
      </span>
      <div className="controversial-item__bar-row">
        <div className="controversial-item__bar">
          <div
            className="controversial-item__bar-fill"
            style={{ width: `${winPct}%` }}
          />
        </div>
        <span className="controversial-item__pct">{winPct}% wins</span>
      </div>
    </motion.div>
  );
}
