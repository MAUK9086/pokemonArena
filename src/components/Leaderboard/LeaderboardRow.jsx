import { motion } from 'framer-motion';
import { leaderboardRowVariants } from '../../animations/arenaAnimations.js';

export function LeaderboardRow({ rank, data, pokemonName, index }) {
  return (
    <motion.div
      className="lb-row"
      variants={leaderboardRowVariants}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <span className="lb-row__rank">#{rank}</span>
      <span className="lb-row__name">{pokemonName || `#${data.pokemon_id}`}</span>
      <span className="lb-row__elo">{data.elo}</span>
      <span className="lb-row__record">{data.wins}W/{data.losses}L</span>
    </motion.div>
  );
}
