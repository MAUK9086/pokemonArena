import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore.js';
import { useLeaderboard } from '../../hooks/useLeaderboard.js';
import { fetchActiveQuestions } from '../../services/rankingService.js';
import { fetchPokemonBatch } from '../../services/pokemonApi.js';
import { FALLBACK_QUESTIONS } from '../../config/questions.js';
import { TabBar } from './TabBar.jsx';
import { LeaderboardRow } from './LeaderboardRow.jsx';
import { ControversialPair } from './ControversialPair.jsx';
import { trackEvent } from '../../analytics.js';

export function Leaderboard() {
  const navigate = useNavigate();
  const { questionId: sessionQuestionId, pool } = useSessionStore();

  // Pokemon data map: id -> pokemon object (name + sprites)
  const [pokemonMap, setPokemonMap] = useState(
    () => Object.fromEntries(pool.map((p) => [p.id, p]))
  );

  // DB question map: slug -> db question, for resolving real UUIDs
  const [dbQuestionMap, setDbQuestionMap] = useState({});
  const [activeLbQuestion, setActiveLbQuestion] = useState(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const dbQuestions = await fetchActiveQuestions();
        const map = {};
        dbQuestions.forEach((q) => { map[q.slug] = q; });
        setDbQuestionMap(map);
      } catch {
        // offline — dbQuestionMap stays empty, will use fallback ids
      }
      const sessionFallback = FALLBACK_QUESTIONS.find((q) => q.id === sessionQuestionId);
      setActiveLbQuestion(sessionFallback ?? FALLBACK_QUESTIONS[0]);
    }
    loadQuestions();
  }, [sessionQuestionId]);

  // Use DB question UUID for ELO queries if available, otherwise fallback id
  const lbQuestionId = activeLbQuestion
    ? (dbQuestionMap[activeLbQuestion.slug]?.id ?? activeLbQuestion.id)
    : null;

  const { tab, topElo, controversial, loading, actions } = useLeaderboard(lbQuestionId);

  // Fetch names/sprites for any pokemon IDs not yet in the map
  useEffect(() => {
    const knownIds = new Set(Object.keys(pokemonMap).map(Number));
    const allIds = [...topElo, ...controversial].map((r) => r.pokemon_id);
    const missing = [...new Set(allIds)].filter((id) => !knownIds.has(id));
    if (missing.length === 0) return;
    fetchPokemonBatch(missing).then((fetched) => {
      setPokemonMap((prev) => {
        const next = { ...prev };
        fetched.forEach((p) => { next[p.id] = p; });
        return next;
      });
    });
  }, [topElo, controversial]);

  function handleQuestionSwitch(q) {
    setActiveLbQuestion(q);
    trackEvent('leaderboard_view', { question_slug: q.slug, tab });
  }

  function handleTabChange(newTab) {
    actions.setTab(newTab);
    trackEvent('leaderboard_view', { tab: newTab, question_slug: activeLbQuestion?.slug });
  }

  return (
    <div className="leaderboard-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn--ghost" onClick={() => navigate(-1)} style={{ padding: '8px 12px' }}>
          ←
        </button>
        <h1 className="leaderboard__title">Leaderboard</h1>
      </div>

      {/* Question pill switcher — always all 5 from FALLBACK_QUESTIONS */}
      <div className="lb-question-pills">
        {FALLBACK_QUESTIONS.map((q) => (
          <button
            key={q.slug}
            className={`lb-question-pill${activeLbQuestion?.slug === q.slug ? ' lb-question-pill--active' : ''}`}
            onClick={() => handleQuestionSwitch(q)}
          >
            {q.shortLabel}
          </button>
        ))}
      </div>

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
                pokemon={pokemonMap[row.pokemon_id]}
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
                pokemon={pokemonMap[row.pokemon_id]}
                index={i}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
