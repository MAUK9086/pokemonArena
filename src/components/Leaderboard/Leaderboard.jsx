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

const FALLBACK_SLUGS = new Set(FALLBACK_QUESTIONS.map((q) => q.slug));

function getLabel(q) {
  if (q.shortLabel) return q.shortLabel;
  const fallback = FALLBACK_QUESTIONS.find((f) => f.slug === q.slug);
  return fallback?.shortLabel ?? q.slug.replace(/-/g, ' ').toUpperCase();
}

export function Leaderboard() {
  const navigate = useNavigate();
  const { question: sessionQuestion, pool } = useSessionStore();

  const [pokemonMap, setPokemonMap] = useState(
    () => Object.fromEntries(pool.map((p) => [p.id, p]))
  );

  // The canonical list of questions to show as pills
  // Starts as FALLBACK_QUESTIONS; replaced with DB questions (same slugs) once loaded
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Always show all 5 FALLBACK_QUESTIONS as pills.
      // For each, swap in the DB question's UUID if a slug match exists so ELO queries work.
      // Questions without a DB match keep their fallback id — leaderboard shows "no data".
      const enriched = FALLBACK_QUESTIONS.map((fq) => ({ ...fq }));
      try {
        const db = await fetchActiveQuestions();
        db.forEach((dbQ) => {
          const idx = enriched.findIndex((fq) => fq.slug === dbQ.slug);
          if (idx !== -1) enriched[idx] = { ...enriched[idx], id: dbQ.id };
        });
      } catch {
        // DB unavailable — use fallback ids (ELO queries return empty, which is fine)
      }
      if (cancelled) return;

      setQuestions(enriched);
      setActiveQuestion((prev) => {
        if (prev !== null) return prev;
        const slug = sessionQuestion?.slug;
        return enriched.find((q) => q.slug === slug) ?? enriched[0];
      });
    }
    load();
    return () => { cancelled = true; };
  }, []); // runs once on mount

  // activeQuestion.id is:
  //   DB UUID when list came from Supabase  → queries correctly
  //   'fallback-*' when offline             → returns empty (expected)
  const lbQuestionId = activeQuestion?.id ?? null;

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
    setActiveQuestion(q);
    trackEvent('leaderboard_view', { question_slug: q.slug, tab });
  }

  function handleTabChange(newTab) {
    actions.setTab(newTab);
    trackEvent('leaderboard_view', { tab: newTab, question_slug: activeQuestion?.slug });
  }

  return (
    <div className="leaderboard-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn--ghost" onClick={() => navigate(-1)} style={{ padding: '8px 12px' }}>
          ←
        </button>
        <h1 className="leaderboard__title">Leaderboard</h1>
      </div>

      <div className="lb-question-pills">
        {questions.map((q) => (
          <button
            key={q.id ?? q.slug}
            className={`lb-question-pill${activeQuestion?.slug === q.slug ? ' lb-question-pill--active' : ''}`}
            onClick={() => handleQuestionSwitch(q)}
          >
            {getLabel(q)}
          </button>
        ))}
      </div>

      {activeQuestion && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
          {activeQuestion.prompt}
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
