import { useState, useEffect } from 'react';
import { fetchPokemonBatch, generateGen1Pool, preloadSprites } from '../services/pokemonApi.js';

export function usePokemonData() {
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setProgress(0);

        const ids = generateGen1Pool(60);
        const pokemon = await fetchPokemonBatch(ids);
        if (cancelled) return;

        setProgress(0.5);

        await preloadSprites(pokemon, (p) => {
          if (!cancelled) setProgress(0.5 + p * 0.5);
        });

        if (!cancelled) {
          setPool(pokemon);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { pool, loading, progress, error };
}
