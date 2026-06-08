import { useRef, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useSessionStore } from '../../store/sessionStore.js';
import { saveSessionResult } from '../../services/rankingService.js';
import { deriveArchetype } from '../../utils/archetypeEngine.js';
import { ArchetypeBadge } from './ArchetypeBadge.jsx';
import { TopThreePodium } from './TopThreePodium.jsx';
import { ImpactLine } from './ImpactLine.jsx';
import { ShareButton } from './ShareButton.jsx';
import { resultCardContainerVariants, resultCardItemVariants } from '../../animations/arenaAnimations.js';
import { trackEvent } from '../../analytics.js';

export function ResultCard() {
  const cardRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlSessionId = searchParams.get('session');

  const { sessionId, question, pool, picks, eloImpacts, matchups, actions } = useSessionStore();

  // Derive top 3 from picks
  const topPicks = Object.entries(picks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => {
      const pokemon = pool.find((p) => p.id === parseInt(id, 10));
      return pokemon ? { pokemon, count: picks[id] } : null;
    })
    .filter(Boolean);

  const archetype = topPicks.length > 0
    ? deriveArchetype(topPicks.map((t) => t.pokemon))
    : null;

  const pokemonMap = Object.fromEntries(pool.map((p) => [p.id, p]));

  useEffect(() => {
    if (!sessionId || matchups.length === 0) return;

    saveSessionResult({
      sessionId,
      questionId: question?.id,
      topPicks: topPicks.map((t) => t.pokemon.id),
      archetype: archetype?.id,
      eloImpacts,
    }).catch(console.warn);

    trackEvent('session_complete', { archetype: archetype?.id });
  }, []);

  async function handleExport() {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#13131a',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `pokemon-arena-${sessionId?.slice(0, 8) ?? 'result'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.warn('Export failed:', err);
    }
  }

  const displaySessionId = urlSessionId || sessionId;

  if (matchups.length === 0 && !urlSessionId) {
    return (
      <div className="result-page">
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '40px' }}>
          No session found. <button className="btn btn--ghost" onClick={() => navigate('/')}>Play now</button>
        </p>
      </div>
    );
  }

  return (
    <div className="result-page">
      <motion.div
        className="result-card"
        ref={cardRef}
        variants={resultCardContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="result-card__header" variants={resultCardItemVariants}>
          <h1 className="result-card__title">Your Results</h1>
          {question && (
            <p className="result-card__question">{question.prompt}</p>
          )}
        </motion.div>

        {topPicks[0] && (
          <motion.div className="result-card__champion" variants={resultCardItemVariants}>
            <span className="result-card__champion-label">Your Champion</span>
            <span className="result-card__champion-name">{topPicks[0].pokemon.name}</span>
          </motion.div>
        )}

        <TopThreePodium topPicks={topPicks} />

        {archetype && <ArchetypeBadge archetype={archetype} />}

        <ImpactLine eloImpacts={eloImpacts} pokemonMap={pokemonMap} />

        <motion.div variants={resultCardItemVariants}>
          <ShareButton onExport={handleExport} sessionId={displaySessionId} />
        </motion.div>
      </motion.div>

      <button
        className="btn btn--ghost"
        onClick={() => { actions.resetSession(); navigate('/'); }}
        style={{ marginTop: '8px' }}
      >
        Play Again
      </button>

      <button
        className="btn btn--ghost"
        onClick={() => navigate('/leaderboard')}
        style={{ marginTop: '4px' }}
      >
        View Leaderboard
      </button>
    </div>
  );
}
