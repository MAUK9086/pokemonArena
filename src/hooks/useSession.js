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

      try {
        const dbQuestions = await fetchActiveQuestions();

        if (overrideQuestion) {
          // Resolve override to DB question by slug so we get a real UUID for ELO storage
          const dbMatch = dbQuestions.find((q) => q.slug === overrideQuestion.slug);
          question = dbMatch ?? overrideQuestion;
        } else if (dbQuestions.length) {
          question = getDailyQuestion(dbQuestions);
        }
      } catch {
        if (overrideQuestion) {
          question = overrideQuestion;
        }
      }

      if (overrideQuestion) actions.clearOverrideQuestion();
      if (!question) question = getDailyQuestion(FALLBACK_QUESTIONS);

      actions.initSession(question, pool);
    }

    start();
  }, [pool, poolLoading, status]);

  return { ...useSessionStore(), poolLoading, progress };
}
