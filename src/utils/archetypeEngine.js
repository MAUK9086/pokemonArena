const ARCHETYPES = [
  {
    id: 'strategist',
    label: 'THE STRATEGIST',
    description: 'Overthinks everything. Correct anyway.',
    color: '#7038F8',
    types: ['psychic', 'steel', 'dragon'],
  },
  {
    id: 'brawler',
    label: 'THE BRAWLER',
    description: 'Loud. Fast. Already tweeted about it.',
    color: '#F08030',
    types: ['fighting', 'fire', 'rock'],
  },
  {
    id: 'mystic',
    label: 'THE MYSTIC',
    description: 'Concerning. Fascinating. Dangerous.',
    color: '#9575CD',
    types: ['ghost', 'dark', 'fairy'],
  },
  {
    id: 'naturalist',
    label: 'THE NATURALIST',
    description: 'Patient. Underestimated. Inevitable.',
    color: '#78C850',
    types: ['grass', 'bug', 'ground'],
  },
  {
    id: 'explorer',
    label: 'THE EXPLORER',
    description: 'Adaptable. Impossible to read.',
    color: '#6890F0',
    types: ['water', 'flying', 'ice'],
  },
  {
    id: 'spark',
    label: 'THE SPARK',
    description: 'Main character energy. Always.',
    color: '#F8D030',
    types: ['electric', 'poison', 'normal'],
  },
];

export function deriveArchetype(pokemonList) {
  const typeCounts = {};
  pokemonList.forEach((p) => {
    (p.types || []).forEach((t) => {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
  });

  let best = null;
  let bestScore = -1;
  for (const arch of ARCHETYPES) {
    const score = arch.types.reduce((acc, t) => acc + (typeCounts[t] || 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = arch;
    }
  }
  return best ?? ARCHETYPES[0];
}
