import { motion } from 'framer-motion';
import { leaderboardRowVariants } from '../../animations/arenaAnimations.js';

export function ControversialPair({ data, pokemon, index }) {
  const total = data.wins + data.losses;
  const winPct = total > 0 ? ((data.wins / total) * 100).toFixed(1) : '0.0';
  const name = pokemon?.name
    ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
    : `#${data.pokemon_id}`;
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.pokemon_id}.png`;

  return (
    <motion.div
      className="controversial-item"
      variants={leaderboardRowVariants}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <img className="controversial-item__sprite" src={spriteUrl} alt={name} />
      <span className="controversial-item__name">{name}</span>
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
