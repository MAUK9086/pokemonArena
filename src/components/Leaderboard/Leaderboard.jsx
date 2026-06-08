import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore.js';
import { useLeaderboard } from '../../hooks/useLeaderboard.js';
import { fetchActiveQuestions } from '../../services/rankingService.js';
import { FALLBACK_QUESTIONS } from '../../config/questions.js';
import { TabBar } from './TabBar.jsx';
import { LeaderboardRow } from './LeaderboardRow.jsx';
import { ControversialPair } from './ControversialPair.jsx';
import { trackEvent } from '../../analytics.js';

export function Leaderboard() {
  const navigate = useNavigate();
  const { questionId: sessionQuestionId, pool } = useSessionStore();
  const pokemonNameMap = Object.fromEntries(pool.map((p) => [p.id, p.name]));

  // All available questions for the pill switcher
  const [allQuestions, setAllQuestions] = useState(FALLBACK_QUESTIONS);
  // Active leaderboard question — default to current session's question
  const [activeLbQuestion, setActiveLbQuestion] = useState(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const dbQuestions = await fetchActiveQuestions();
        if (dbQuestions.length) {
          setAllQuestions(dbQuestions);
          // Default to session question if it's in the list, otherwise first
          const match = dbQuestions.find((q) => q.id === sessionQuestionId);
          setActiveLbQuestion(match ?? dbQuestions[0]);
        } else {
          const fallbackMatch = FALLBACK_QUESTIONS.find((q) => q.id === sessionQuestionId);
          setActiveLbQuestion(fallbackMatch ?? FALLBACK_QUESTIONS[0]);
        }
      } catch {
        const fallbackMatch = FALLBACK_QUESTIONS.find((q) => q.id === sessionQuestionId);
        setActiveLbQuestion(fallbackMatch ?? FALLBACK_QUESTIONS[0]);
      }
    }
    loadQuestions();
  }, [sessionQuestionId]);

  const { tab, topElo, controversial, loading, actions } = useLeaderboard(activeLbQuestion?.id);

  function handleQuestionSwitch(q) {
    setActiveLbQuestion(q);
    trackEvent('leaderboard_view', { question_slug: q.slug, tab });
  }

  function handleTabChange(newTab) {
    actions.setTab(newTab);
    trackEvent('leaderboard_view', { tab: newTab, question_slug: activeLbQuestion?.slug });
  }

  // Short label: use shortLabel if present (fallback questions), otherwise truncate prompt
  function getLabel(q) {
    if (q.shortLabel) return q.shortLabel;
    const words = q.prompt.split(' ');
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '…' : '');
  }

  return (
    <div className="leaderboard-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn--ghost" onClick={() => navigate(-1)} style={{ padding: '8px 12px' }}>
          ←
        </button>
        <h1 className="leaderboard__title">Leaderboard</h1>
      </div>

      {/* Question pill switcher */}
      <div className="lb-question-pills">
        {allQuestions.map((q) => (
          <button
            key={q.id ?? q.slug}
            className={`lb-question-pill${activeLbQuestion?.slug === q.slug ? ' lb-question-pill--active' : ''}`}
            onClick={() => handleQuestionSwitch(q)}
          >
            {getLabel(q)}
          </button>
        ))}
      </div>

      {/* Active question prompt */}
      {activeLbQuestion && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
          {activeLbQuestion.prompt}
        </p>
      )}

      <TabBar activeTab={tab} onSelect={handleTabChange} />

      {loading && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading...</p>
      )}

      {!loading && tab === 'top' && (
        <div className="lb-list">
          {topElo.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              No data yet — play some matchups first!
            </p>
          ) : (
            topElo.map((row, i) => (
              <LeaderboardRow
                key={row.pokemon_id}
                rank={i + 1}
                data={row}
                pokemonName={pokemonNameMap[row.pokemon_id]}
                index={i}
              />
            ))
          )}
        </div>
      )}

      {!loading && tab === 'controversial' && (
        <div className="lb-list">
          {controversial.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Not enough data yet.
            </p>
          ) : (
            controversial.map((row, i) => (
              <ControversialPair
                key={row.pokemon_id}
                data={row}
                pokemonName={pokemonNameMap[row.pokemon_id]}
                index={i}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
