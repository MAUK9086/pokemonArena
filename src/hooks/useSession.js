import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/sessionStore.js';
import { usePokemonData } from './usePokemonData.js';
import { fetchActiveQuestions } from '../services/rankingService.js';
import { getDailyQuestion, FALLBACK_QUESTIONS } from '../config/questions.js';

export function useSession() {
  const { pool, loading: poolLoading, progress } = usePokemonData();
  const { status, overrideQuestion, actions } = useSessionStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (poolLoading || pool.length < 2 || status !== 'idle' || initialized.current) return;

    async function start() {
      initialized.current = true;
      let question = null;

      // User picked a specific question from the results screen
      if (overrideQuestion) {
        question = overrideQuestion;
        actions.clearOverrideQuestion();
      } else {
        try {
          const dbQuestions = await fetchActiveQuestions();
          if (dbQuestions.length) question = getDailyQuestion(dbQuestions);
        } catch {
          // Supabase unavailable — fall through to fallback
        }
        if (!question) question = getDailyQuestion(FALLBACK_QUESTIONS);
      }

      actions.initSession(question, pool);
    }

    start();
  }, [pool, poolLoading, status]);

  return { ...useSessionStore(), poolLoading, progress };
}
