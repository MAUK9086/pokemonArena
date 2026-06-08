import { motion } from 'framer-motion';
import { leaderboardRowVariants } from '../../animations/arenaAnimations.js';

export function LeaderboardRow({ rank, data, pokemon, index }) {
  const name = pokemon?.name
    ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
    : `#${data.pokemon_id}`;
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.pokemon_id}.png`;

  return (
    <motion.div
      className="lb-row"
      variants={leaderboardRowVariants}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <span className="lb-row__rank">#{rank}</span>
      <img className="lb-row__sprite" src={spriteUrl} alt={name} />
      <span className="lb-row__name">{name}</span>
      <span className="lb-row__elo">{data.elo}</span>
      <span className="lb-row__record">{data.wins}W/{data.losses}L</span>
    </motion.div>
  );
}
