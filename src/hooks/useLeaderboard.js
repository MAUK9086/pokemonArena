import { useEffect, useRef } from 'react';
import { useLeaderboardStore } from '../store/leaderboardStore.js';
import { fetchTopByElo, fetchMostControversial } from '../services/rankingService.js';

const POLL_INTERVAL = 10000;

export function useLeaderboard(questionId) {
  const { actions, ...state } = useLeaderboardStore();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!questionId) return;

    actions.clearData();

    async function fetchAll() {
      actions.setLoading(true);
      const [topElo, controversial] = await Promise.all([
        fetchTopByElo(questionId, 20),
        fetchMostControversial(questionId, 10),
      ]);
      actions.setData({ topElo, controversial, onStreak: [], questionId });
    }

    fetchAll();
    timerRef.current = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [questionId]);

  return { ...state, actions };
}
