import { supabase } from './supabase.js';
import { calculateElo, DEFAULT_ELO } from '../utils/elo.js';

export async function getPokemonElo(pokemonId, questionId) {
  if (!supabase) return DEFAULT_ELO;
  const { data } = await supabase
    .from('pokemon_elo')
    .select('elo')
    .eq('pokemon_id', pokemonId)
    .eq('question_id', questionId)
    .single();
  return data?.elo ?? DEFAULT_ELO;
}

// Returns { newWinnerElo, newLoserElo } or null if offline
export async function recordMatch({ winnerId, loserId, questionId, sessionId, winnerElo, loserElo }) {
  if (!supabase) return null;

  const { newWinnerElo, newLoserElo } = calculateElo(winnerElo, loserElo);
  const winnerDelta = newWinnerElo - winnerElo;
  const loserDelta = newLoserElo - loserElo;

  // Atomic ELO update via RPC to avoid race conditions
  await Promise.all([
    supabase.rpc('update_elo', {
      p_pokemon_id: winnerId,
      p_question_id: questionId,
      p_elo_delta: winnerDelta,
      p_is_win: true,
    }),
    supabase.rpc('update_elo', {
      p_pokemon_id: loserId,
      p_question_id: questionId,
      p_elo_delta: loserDelta,
      p_is_win: false,
    }),
  ]);

  await supabase.from('matches').insert({
    question_id: questionId,
    winner_id: winnerId,
    loser_id: loserId,
    winner_elo_after: newWinnerElo,
    loser_elo_after: newLoserElo,
    session_id: sessionId,
  });

  return { newWinnerElo, newLoserElo };
}

export async function fetchTopByElo(questionId, limit = 20) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('pokemon_elo')
    .select('pokemon_id, elo, wins, losses')
    .eq('question_id', questionId)
    .order('elo', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function fetchMostControversial(questionId, limit = 10) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('pokemon_elo')
    .select('pokemon_id, elo, wins, losses')
    .eq('question_id', questionId)
    .gt('wins', 0)
    .gt('losses', 0)
    .limit(100);

  if (!data) return [];
  return data
    .map((r) => ({
      ...r,
      controversy: Math.abs(r.wins / (r.wins + r.losses) - 0.5),
    }))
    .sort((a, b) => a.controversy - b.controversy)
    .slice(0, limit);
}

export async function saveSessionResult({ sessionId, questionId, topPicks, archetype, eloImpacts }) {
  if (!supabase) return;
  await supabase.from('session_results').upsert({
    session_id: sessionId,
    question_id: questionId,
    top_picks: topPicks,
    archetype,
    elo_impacts: eloImpacts,
  });
}

export async function fetchSessionResult(sessionId) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('session_results')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  return data;
}

export async function fetchActiveQuestions() {
  if (!supabase) return [];
  const { data } = await supabase
    .from('questions')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  return data ?? [];
}
