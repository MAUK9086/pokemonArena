export const DEFAULT_ELO = 1000;
export const K_FACTOR = 32;

export function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateElo(winnerElo, loserElo) {
  const expectedWinner = expectedScore(winnerElo, loserElo);
  const expectedLoser = expectedScore(loserElo, winnerElo);
  return {
    newWinnerElo: Math.round(winnerElo + K_FACTOR * (1 - expectedWinner)),
    newLoserElo: Math.round(loserElo + K_FACTOR * (0 - expectedLoser)),
  };
}
