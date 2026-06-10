import { useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useSessionStore } from '../../store/sessionStore.js';
import { saveSessionResult } from '../../services/rankingService.js';
import { deriveArchetype } from '../../utils/archetypeEngine.js';
import { FALLBACK_QUESTIONS } from '../../config/questions.js';
import { ArchetypeBadge } from './ArchetypeBadge.jsx';
import { TopThreePodium } from './TopThreePodium.jsx';
import { ImpactLine } from './ImpactLine.jsx';
import { ShareButton } from './ShareButton.jsx';
import { resultCardContainerVariants, resultCardItemVariants } from '../../animations/arenaAnimations.js';
import { trackEvent } from '../../analytics.js';

export function ResultCard() {
  const cardRef = useRef(null);
  const exportRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlSessionId = searchParams.get('session');

  const { sessionId, question, pool, picks, eloImpacts, matchups, actions } = useSessionStore();

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
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, {
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

  function handlePickQuestion(q) {
    actions.setOverrideQuestion(q);
    actions.resetSession();
    navigate('/');
  }

  const displaySessionId = urlSessionId || sessionId;

  if (matchups.length === 0 && !urlSessionId) {
    return (
      <div className="result-page">
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '40px' }}>
          No session found.{' '}
          <button className="btn btn--ghost" onClick={() => navigate('/')}>Play now</button>
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
        <div ref={exportRef}>
          <motion.div className="result-card__header" variants={resultCardItemVariants}>
            <h1 className="result-card__title">Your Results</h1>
            {question && <p className="result-card__question">{question.prompt}</p>}
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
        </div>

        <motion.div variants={resultCardItemVariants}>
          <ShareButton onExport={handleExport} sessionId={displaySessionId} />
        </motion.div>
      </motion.div>

      <motion.button
        className="btn btn--secondary results-leaderboard-btn"
        onClick={() => navigate('/leaderboard')}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        View Global Rankings
      </motion.button>

      {/* Question picker — play a different question */}
      <motion.div
        className="question-picker"
        style={{ maxWidth: 'var(--arena-max-width)', width: '100%', marginTop: '24px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="question-picker__heading">play another question</p>
        {FALLBACK_QUESTIONS.map((q) => {
          const isActive = question?.slug === q.slug;
          return (
            <button
              key={q.slug}
              className={`question-picker__btn${isActive ? ' question-picker__btn--active' : ''}`}
              style={{ borderLeftColor: q.categoryColor ?? 'var(--color-border)' }}
              onClick={() => handlePickQuestion(q)}
            >
              <span
                className="question-picker__tag"
                style={{ color: q.categoryColor ?? 'var(--color-text-muted)' }}
              >
                {q.shortLabel}
              </span>
              <span className="question-picker__text">{q.prompt}</span>
            </button>
          );
        })}
      </motion.div>

      <div style={{ marginBottom: '32px' }} />
    </div>
  );
}
