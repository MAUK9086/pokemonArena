-- ============================================================
-- Pokémon Pairwise Arena — Supabase Schema
-- Run this in the Supabase SQL Editor (in order)
-- ============================================================

-- ===== TABLES =====

CREATE TABLE questions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  prompt      text NOT NULL,
  category    text CHECK (category IN ('survival','comedy','aesthetic','battle')),
  active      boolean DEFAULT true,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE pokemon_elo (
  pokemon_id  integer NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  elo         integer DEFAULT 1000,
  wins        integer DEFAULT 0,
  losses      integer DEFAULT 0,
  PRIMARY KEY (pokemon_id, question_id)
);

CREATE TABLE matches (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id      uuid REFERENCES questions(id) ON DELETE SET NULL,
  winner_id        integer NOT NULL,
  loser_id         integer NOT NULL,
  winner_elo_after integer,
  loser_elo_after  integer,
  session_id       text,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE session_results (
  session_id  text PRIMARY KEY,
  question_id uuid REFERENCES questions(id) ON DELETE SET NULL,
  top_picks   integer[],
  archetype   text,
  elo_impacts jsonb,
  created_at  timestamptz DEFAULT now()
);

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_elo    ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_results ENABLE ROW LEVEL SECURITY;

-- questions: public read (active only)
CREATE POLICY "anon read questions"
  ON questions FOR SELECT TO anon USING (active = true);

-- pokemon_elo: public read, no direct writes (use RPC)
CREATE POLICY "anon read elo"
  ON pokemon_elo FOR SELECT TO anon USING (true);

-- matches: public read + anon insert
CREATE POLICY "anon read matches"
  ON matches FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert matches"
  ON matches FOR INSERT TO anon WITH CHECK (true);

-- session_results: public read + anon insert/upsert
CREATE POLICY "anon read sessions"
  ON session_results FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert sessions"
  ON session_results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update sessions"
  ON session_results FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ===== ATOMIC ELO UPDATE RPC =====
-- SECURITY DEFINER: runs as the table owner, bypasses RLS for pokemon_elo writes.
-- Clients call this via supabase.rpc('update_elo', {...}) instead of direct table writes.

CREATE OR REPLACE FUNCTION update_elo(
  p_pokemon_id  integer,
  p_question_id uuid,
  p_elo_delta   integer,
  p_is_win      boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO pokemon_elo (pokemon_id, question_id, elo, wins, losses)
  VALUES (
    p_pokemon_id,
    p_question_id,
    1000 + p_elo_delta,
    CASE WHEN p_is_win THEN 1 ELSE 0 END,
    CASE WHEN p_is_win THEN 0 ELSE 1 END
  )
  ON CONFLICT (pokemon_id, question_id) DO UPDATE SET
    elo    = pokemon_elo.elo + p_elo_delta,
    wins   = pokemon_elo.wins   + CASE WHEN p_is_win THEN 1 ELSE 0 END,
    losses = pokemon_elo.losses + CASE WHEN p_is_win THEN 1 ELSE 0 END;
END;
$$;

-- ===== AUTO-INIT ELO ON QUESTION CREATE =====
-- When a new question is inserted, automatically create 151 ELO rows (Gen 1).

CREATE OR REPLACE FUNCTION init_elo_for_question()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO pokemon_elo (pokemon_id, question_id)
  SELECT gs, NEW.id
  FROM generate_series(1, 151) AS gs
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_question_created
  AFTER INSERT ON questions
  FOR EACH ROW EXECUTE FUNCTION init_elo_for_question();

-- ===== SEED: INITIAL QUESTIONS =====

INSERT INTO questions (slug, prompt, category, sort_order) VALUES
  ('zombie-apocalypse', 'Zombie apocalypse — who is your survival partner?',                           'survival',  1),
  ('snitch',            'Which one would 100% snitch on you to the police?',                           'comedy',    2),
  ('job-interview',     'You can only bring one as emotional support to a job interview.',              'comedy',    3),
  ('bar-fight',         'Bar fight breaks out. Who do you want watching your back?',                   'battle',    4),
  ('elevator',          'Stuck in an elevator for 6 hours. Who makes it survivable?',                  'survival',  5),
  ('instagram-viral',   'Which one goes viral on Instagram within a week?',                            'aesthetic', 6),
  ('apartment',         'Share a 1BHK apartment for a year. Who causes the least property damage?',   'comedy',    7),
  ('haircut',           'You trust one of them to cut your hair. Who do you pick?',                    'comedy',    8),
  ('music-taste',       'Which one has better music taste?',                                           'aesthetic', 9),
  ('school-bully',      'If they were both human, which one was definitely the school bully?',         'comedy',   10);

-- ===== OPTIONAL: CLEANUP OLD SESSION RESULTS =====
-- Run this periodically (e.g. via a cron job or Supabase Edge Function) to prune old data.
-- DELETE FROM session_results WHERE created_at < now() - interval '30 days';
