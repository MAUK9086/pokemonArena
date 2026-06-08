import { create } from 'zustand';
import { getOrCreateSessionId } from '../utils/sessionId.js';

const TOTAL_MATCHUPS = 20;

function drawOne(pool) {
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function drawTwo(pool) {
  if (pool.length < 2) return [pool[0] ?? null, null];
  const i = Math.floor(Math.random() * pool.length);
  let j = Math.floor(Math.random() * (pool.length - 1));
  if (j >= i) j++;
  return [pool[i], pool[j]];
}

export const useSessionStore = create((set, get) => ({
  sessionId: getOrCreateSessionId(),
  question: null,
  questionId: null,

  pool: [],           // all pokemon objects for this session
  usedIds: new Set(), // IDs already seen this session

  left: null,
  right: null,

  // champion: { pokemon, winStreak } | null
  // winStreak 1 = won once, 2 = won twice, 3 → retire before setting
  champion: null,

  matchups: [],       // [{ winnerId, loserId, matchIndex }]
  matchupCount: 0,
  picks: {},          // { [pokemonId]: count }
  eloImpacts: {},     // { [pokemonId]: netEloDelta }

  status: 'idle',     // 'idle' | 'active' | 'complete'

  actions: {
    initSession(question, pokemonPool) {
      const freshId = getOrCreateSessionId();
      set({
        sessionId: freshId,
        question,
        questionId: question.id,
        pool: [...pokemonPool],
        usedIds: new Set(),
        champion: null,
        matchups: [],
        matchupCount: 0,
        picks: {},
        eloImpacts: {},
        left: null,
        right: null,
        status: 'active',
      });
      get().actions._advance();
    },

    _advance() {
      const { pool, usedIds, champion, matchupCount } = get();
      if (matchupCount >= TOTAL_MATCHUPS) {
        set({ status: 'complete' });
        return;
      }

      const available = pool.filter((p) => !usedIds.has(p.id));

      if (champion) {
        // Champion defends — draw one new challenger
        const challengers = available.filter((p) => p.id !== champion.pokemon.id);
        const right = drawOne(challengers);
        if (!right) { set({ status: 'complete' }); return; }
        set({
          left: champion.pokemon,
          right,
          usedIds: new Set([...usedIds, right.id]),
        });
      } else {
        const [left, right] = drawTwo(available);
        if (!left || !right) { set({ status: 'complete' }); return; }
        set({
          left,
          right,
          usedIds: new Set([...usedIds, left.id, right.id]),
        });
      }
    },

    recordPick(winnerId) {
      const { left, right, champion, matchupCount, picks, matchups } = get();
      if (!left || !right) return;

      const winner = left.id === winnerId ? left : right;
      const loser = left.id === winnerId ? right : left;

      const newPicks = { ...picks, [winnerId]: (picks[winnerId] || 0) + 1 };
      const newMatchups = [
        ...matchups,
        { winnerId: winner.id, loserId: loser.id, matchIndex: matchupCount },
      ];

      // Champion mechanic
      let newChampion;
      if (champion && champion.pokemon.id === winnerId) {
        const newStreak = champion.winStreak + 1;
        // 3rd win → retire, no champion carries forward
        newChampion = newStreak >= 3 ? null : { pokemon: winner, winStreak: newStreak };
      } else {
        newChampion = { pokemon: winner, winStreak: 1 };
      }

      set({
        champion: newChampion,
        matchups: newMatchups,
        matchupCount: matchupCount + 1,
        picks: newPicks,
      });

      get().actions._advance();
    },

    updateEloImpact(pokemonId, delta) {
      const { eloImpacts } = get();
      set({
        eloImpacts: {
          ...eloImpacts,
          [pokemonId]: (eloImpacts[pokemonId] || 0) + delta,
        },
      });
    },

    resetSession() {
      set({
        sessionId: getOrCreateSessionId(),
        question: null,
        questionId: null,
        pool: [],
        usedIds: new Set(),
        left: null,
        right: null,
        champion: null,
        matchups: [],
        matchupCount: 0,
        picks: {},
        eloImpacts: {},
        status: 'idle',
      });
    },
  },
}));
