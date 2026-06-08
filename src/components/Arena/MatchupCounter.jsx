export function MatchupCounter({ current, total = 20 }) {
  const pct = (current / total) * 100;
  return (
    <div
      className="matchup-counter"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemax={total}
      aria-label={`Matchup ${current} of ${total}`}
    >
      <span className="matchup-counter__label">{current} / {total}</span>
      <div className="matchup-counter__bar">
        <div className="matchup-counter__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
