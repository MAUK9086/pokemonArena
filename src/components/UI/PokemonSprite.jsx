import { useState } from 'react';

export function PokemonSprite({ pokemon, side, size, forExport = false }) {
  const [useFallback, setUseFallback] = useState(false);

  const src =
    forExport || useFallback || !pokemon.spriteAnimated
      ? pokemon.spriteStatic
      : pokemon.spriteAnimated;

  const mirrored = side === 'right';

  return (
    <img
      className="pokemon-slot__sprite"
      src={src}
      alt={pokemon.name}
      style={{
        // Explicit size (e.g. podium): use it, capped at 100% of container
        // No size: CSS class handles responsive sizing
        ...(size ? { width: `${size}px`, maxWidth: '100%' } : {}),
        imageRendering: 'pixelated',
        transform: mirrored ? 'scaleX(-1)' : 'none',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      onError={() => setUseFallback(true)}
      draggable={false}
      crossOrigin="anonymous"
    />
  );
}
