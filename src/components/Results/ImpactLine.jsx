import { motion } from 'framer-motion';
import { resultCardItemVariants } from '../../animations/arenaAnimations.js';

export function ImpactLine({ eloImpacts, pokemonMap }) {
  if (!eloImpacts || Object.keys(eloImpacts).length === 0) return null;

  const topEntry = Object.entries(eloImpacts).sort(
    ([, a], [, b]) => Math.abs(b) - Math.abs(a)
  )[0];

  if (!topEntry) return null;

  const [id, delta] = topEntry;
  const name = pokemonMap?.[id]?.name ?? `#${id}`;
  const sign = delta > 0 ? '+' : '';

  return (
    <motion.p className="impact-line" variants={resultCardItemVariants}>
      Your picks moved <strong>{name}</strong> {sign}{delta} ELO globally
    </motion.p>
  );
}
