const ARCHETYPES = [
  {
    id: 'strategist',
    label: 'The Strategist',
    description: 'Overthinks everything. Correct anyway.',
    icon: '🧠',
    types: ['psychic', 'steel', 'dragon'],
  },
  {
    id: 'brawler',
    label: 'The Brawler',
    description: 'Loud. Fast. Already tweeted about it.',
    icon: '💪',
    types: ['fighting', 'fire', 'rock'],
  },
  {
    id: 'mystic',
    label: 'The Mystic',
    description: 'Concerning. Fascinating. Dangerous.',
    icon: '🌙',
    types: ['ghost', 'dark', 'fairy'],
  },
  {
    id: 'naturalist',
    label: 'The Naturalist',
    description: 'Patient. Underestimated. Inevitable.',
    icon: '🌿',
    types: ['grass', 'bug', 'ground'],
  },
  {
    id: 'explorer',
    label: 'The Explorer',
    description: 'Adaptable. Impossible to read.',
    icon: '🌊',
    types: ['water', 'flying', 'ice'],
  },
  {
    id: 'spark',
    label: 'The Spark',
    description: 'Main character energy. Always.',
    icon: '⚡',
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
