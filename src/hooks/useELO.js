import { useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore.js';
import { recordMatch, getPokemonElo } from '../services/rankingService.js';

export function useELO() {
  const { sessionId, questionId, actions } = useSessionStore();

  const submitMatch = useCallback(
    async (winnerId, loserId) => {
      if (!questionId) return;

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
