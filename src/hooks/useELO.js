import { useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore.js';
import { recordMatch, getPokemonElo } from '../services/rankingService.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useELO() {
  const { sessionId, questionId, actions } = useSessionStore();

  const submitMatch = useCallback(
    async (winnerId, loserId) => {
      // Skip when offline or using a fallback question (non-UUID IDs fail the Supabase FK cast)
      if (!questionId || !UUID_RE.test(questionId)) return;

      try {
        const [winnerElo, loserElo] = await Promise.all([
          getPokemonElo(winnerId, questionId),
          getPokemonElo(loserId, questionId),
        ]);

        const result = await recordMatch({
          winnerId,
          loserId,
          questionId,
          sessionId,
          winnerElo,
          loserElo,
        });

        if (result) {
          actions.updateEloImpact(winnerId, result.newWinnerElo - winnerElo);
          actions.updateEloImpact(loserId, result.newLoserElo - loserElo);
        }
      } catch (err) {
        console.warn('[ELO] Failed to record match:', err);
      }
    },
    [sessionId, questionId, actions]
  );

  return { submitMatch };
}
