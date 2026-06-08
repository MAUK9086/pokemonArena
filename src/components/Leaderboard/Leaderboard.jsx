import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore.js';
import { useLeaderboard } from '../../hooks/useLeaderboard.js';
import { TabBar } from './TabBar.jsx';
import { LeaderboardRow } from './LeaderboardRow.jsx';
import { ControversialPair } from './ControversialPair.jsx';
import { trackEvent } from '../../analytics.js';

export function Leaderboard() {
  const navigate = useNavigate();
  const { questionId, pool } = useSessionStore();
  const { tab, topElo, controversial, loading, actions } = useLeaderboard(questionId);

  const pokemonNameMap = Object.fromEntries(pool.map((p) => [p.id, p.name]));

  function handleTabChange(newTab) {
    actions.setTab(newTab);
    trackEvent('leaderboard_view', { tab: newTab });
  }

  return (
    <div className="leaderboard-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn--ghost" onClick={() => navigate('/')} style={{ padding: '8px 12px' }}>
          ←
        </button>
        <h1 className="leaderboard__title">Leaderboard</h1>
      </div>

      <TabBar activeTab={tab} onSelect={handleTabChange} />

      {loading && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Loading...
        </p>
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
