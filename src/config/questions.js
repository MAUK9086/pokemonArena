// ADMIN: Add new questions here as a fallback. Supabase DB is the source of truth.
// To add a question via DB: INSERT INTO questions (slug, prompt, category, sort_order) VALUES (...)

export const FALLBACK_QUESTIONS = [
  {
    id: 'fallback-zombie',
    slug: 'zombie-apocalypse',
    prompt: 'Zombie apocalypse — who is your survival partner?',
    category: 'survival',
  },
  {
    id: 'fallback-snitch',
    slug: 'snitch',
    prompt: 'Which one would 100% snitch on you to the police?',
    category: 'comedy',
  },
  {
    id: 'fallback-interview',
    slug: 'job-interview',
    prompt: 'You can only bring one as emotional support to a job interview. Who do you bring?',
    category: 'comedy',
  },
  {
    id: 'fallback-bar-fight',
    slug: 'bar-fight',
    prompt: 'Bar fight breaks out. Who do you want watching your back?',
    category: 'battle',
  },
  {
    id: 'fallback-elevator',
    slug: 'elevator',
    prompt: 'Stuck in an elevator for 6 hours. Who makes it survivable?',
    category: 'survival',
  },
  {
    id: 'fallback-instagram',
    slug: 'instagram-viral',
    prompt: 'Which one goes viral on Instagram within a week?',
    category: 'aesthetic',
  },
  {
    id: 'fallback-apartment',
    slug: 'apartment',
    prompt: 'Share a 1BHK apartment for a year. Who causes the least property damage?',
    category: 'comedy',
  },
  {
    id: 'fallback-haircut',
    slug: 'haircut',
    prompt: 'You trust one of them to cut your hair. Who do you pick?',
    category: 'comedy',
  },
  {
    id: 'fallback-music',
    slug: 'music-taste',
    prompt: 'Which one has better music taste?',
    category: 'aesthetic',
  },
  {
    id: 'fallback-bully',
    slug: 'school-bully',
    prompt: 'If they were both human, which one was definitely the school bully?',
    category: 'comedy',
  },
];

export function getDailyQuestion(questions = FALLBACK_QUESTIONS) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
  const diff = now - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return questions[dayOfYear % questions.length];
}
