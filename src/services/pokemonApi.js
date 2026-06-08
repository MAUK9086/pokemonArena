import { openDB } from 'idb';

const DB_NAME = 'pokemon-arena-cache';
const DB_VERSION = 1;
const POKEMON_STORE = 'pokemon';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(POKEMON_STORE, { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

function normalizePokemon(raw) {
  return {
    id: raw.id,
    name: raw.name,
    spriteAnimated:
      raw.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default ?? null,
    spriteStatic:
      raw.sprites?.other?.['official-artwork']?.front_default ??
      raw.sprites?.front_default ??
      null,
    types: raw.types.map((t) => t.type.name),
  };
}

export async function fetchPokemon(id) {
  const db = await getDB();
  const cached = await db.get(POKEMON_STORE, id);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`PokéAPI error for id=${id}: ${res.status}`);
  const raw = await res.json();

  const normalized = normalizePokemon(raw);
  await db.put(POKEMON_STORE, { id, data: normalized, cachedAt: Date.now() });
  return normalized;
}

export async function fetchPokemonBatch(ids) {
  const results = await Promise.allSettled(ids.map((id) => fetchPokemon(id)));
  return results
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);
}

// Generate a pool of unique IDs from Gen 1 (1–151)
export function generateGen1Pool(size = 60) {
  const ids = new Set();
  while (ids.size < Math.min(size, 151)) {
    ids.add(Math.floor(Math.random() * 151) + 1);
  }
  return [...ids];
}

// Preload sprite images into the browser cache
export async function preloadSprites(pokemonList, onProgress) {
  let loaded = 0;
  await Promise.all(
    pokemonList.map(
      (p) =>
        new Promise((resolve) => {
          const src = p.spriteAnimated || p.spriteStatic;
          if (!src) { resolve(); return; }
          const img = new Image();
          img.onload = img.onerror = () => {
            loaded++;
            onProgress?.(loaded / pokemonList.length);
            resolve();
          };
          img.src = src;
        })
    )
  );
}
