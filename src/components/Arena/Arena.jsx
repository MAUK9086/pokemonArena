import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useSession } from '../../hooks/useSession.js';
import { useELO } from '../../hooks/useELO.js';
import { useSwipeGesture } from '../../hooks/useSwipeGesture.js';
import { ArenaBackground } from './ArenaBackground.jsx';
import { PokemonSlot } from './PokemonSlot.jsx';
import { VSDivider } from './VSDivider.jsx';
import { StreakBadge } from './StreakBadge.jsx';
import { MatchupCounter } from './MatchupCounter.jsx';
import { SwipeHint } from './SwipeHint.jsx';
import { LoadingScreen } from '../UI/LoadingScreen.jsx';
import { InstructionsOverlay } from '../UI/InstructionsOverlay.jsx';
import { trackEvent } from '../../analytics.js';

export function Arena() {
  const navigate = useNavigate();
  const {
    left,
    right,
    champion,
    matchupCount,
    status,
    question,
    sessionId,
    poolLoading,
    progress,
    actions,
  } = useSession();

  const { submitMatch } = useELO();

  useEffect(() => {
    if (status === 'complete' && sessionId) {
      navigate(`/results?session=${sessionId}`);
    }
  }, [status, navigate, sessionId]);

  useEffect(() => {
    if (status === 'active') {
      document.body.classList.add('arena-active');
      trackEvent('session_start', { question_slug: question?.slug });
    }
    return () => document.body.classList.remove('arena-active');
  }, [status]);

  function handlePick(winnerId) {
    if (!left || !right || status !== 'active') return;
    const loserId = left.id === winnerId ? right.id : left.id;
    actions.recordPick(winnerId);
    submitMatch(winnerId, loserId);
    trackEvent('pick', { pokemon_id: winnerId, matchup_number: matchupCount + 1 });
  }

  const { bind } = useSwipeGesture({
    onPickLeft: () => left && handlePick(left.id),
    onPickRight: () => right && handlePick(right.id),
    disabled: status !== 'active',
  });

  if (poolLoading || status === 'idle' || !left || !right) {
    return <LoadingScreen message="Loading arena..." progress={progress} />;
  }

  return (
    <div className="arena" {...bind()}>
      <ArenaBackground
        leftType={left.types[0]}
        rightType={right.types[0]}
      />
      <div className="arena__ui">
        <MatchupCounter current={matchupCount} total={10} />

        {question && (
          <p className="arena__question">{question.prompt}</p>
        )}

        <div className="arena__matchup">
          <PokemonSlot
            pokemon={left}
            side="left"
            onClick={() => handlePick(left.id)}
          />
          <VSDivider />
          <PokemonSlot
            pokemon={right}
            side="right"
            onClick={() => handlePick(right.id)}
          />
        </div>

        {champion && (
          <StreakBadge
            streak={champion.winStreak}
            name={champion.pokemon.name}
          />
        )}

        {matchupCount === 0 && <SwipeHint />}
      </div>
      <InstructionsOverlay />
    </div>
  );
}
