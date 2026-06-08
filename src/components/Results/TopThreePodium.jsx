import { motion } from 'framer-motion';
import { resultCardItemVariants } from '../../animations/arenaAnimations.js';
import { PokemonSprite } from '../UI/PokemonSprite.jsx';

export function TopThreePodium({ topPicks }) {
  if (!topPicks || topPicks.length === 0) return null;

  const [first, second, third] = topPicks;

  return (
    <motion.div className="podium" variants={resultCardItemVariants}>
      {second && (
        <div className="podium__slot podium__slot--2">
          <PokemonSprite pokemon={second.pokemon} side="left" size={60} forExport />
          <span className="podium__name">{second.pokemon.name}</span>
          <div className="podium__pedestal podium__pedestal--2">2nd</div>
        </div>
      )}
      {first && (
        <div className="podium__slot podium__slot--1">
          <PokemonSprite pokemon={first.pokemon} side="left" size={80} forExport />
          <span className="podium__name">{first.pokemon.name}</span>
          <div className="podium__pedestal podium__pedestal--1">1st</div>
        </div>
      )}
      {third && (
        <div className="podium__slot podium__slot--3">
          <PokemonSprite pokemon={third.pokemon} side="left" size={50} forExport />
          <span className="podium__name">{third.pokemon.name}</span>
          <div className="podium__pedestal podium__pedestal--3">3rd</div>
        </div>
      )}
    </motion.div>
  );
}
