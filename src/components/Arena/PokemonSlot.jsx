import { motion, AnimatePresence } from 'framer-motion';
import { PokemonSprite } from '../UI/PokemonSprite.jsx';
import { TypeBadge } from '../UI/TypeBadge.jsx';
import { pokemonSlotVariants } from '../../animations/arenaAnimations.js';

export function PokemonSlot({ pokemon, side, onClick }) {
  return (
    <motion.button
      className={`pokemon-slot pokemon-slot--${side}`}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      aria-label={`Pick ${pokemon.name}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={pokemon.id}
          className="pokemon-slot__inner"
          custom={side}
          variants={pokemonSlotVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <PokemonSprite pokemon={pokemon} side={side} size={180} />
          <p className="pokemon-slot__name">{pokemon.name}</p>
          <div className="pokemon-slot__types">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
