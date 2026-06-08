import { useState } from 'react';

export function PokemonSprite({ pokemon, side, size = 180, forExport = false }) {
  const [useFallback, setUseFallback] = useState(false);

  // For html2canvas export use static (GIFs don't export cleanly)
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
      width={size}
      height={size}
      style={{
        imageRendering: 'pixelated',
        transform: mirrored ? 'scaleX(-1)' : 'none',
        userSelect: 'none',
        pointerEvents: 'none',
        objectFit: 'contain',
      }}
      onError={() => setUseFallback(true)}
      draggable={false}
      crossOrigin="anonymous"
    />
  );
}
