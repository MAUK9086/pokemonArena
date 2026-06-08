// ADMIN: This is the fallback question list. Supabase DB is the source of truth.
// To add a question via DB: INSERT INTO questions (slug, prompt, category, sort_order) VALUES (...)

export const FALLBACK_QUESTIONS = [
  {
    id: 'fallback-snitch',
    slug: 'snitch',
    prompt: 'Which one would 100% snitch on you to the police?',
    shortLabel: 'SNITCH',
    category: 'comedy',
    categoryColor: '#F8D030',
  },
  {
    id: 'fallback-zombie',
    slug: 'zombie',
    prompt: 'Zombie apocalypse. You can only bring one. Who survives with you?',
    shortLabel: 'ZOMBIE',
    category: 'survival',
    categoryColor: '#78C850',
  },
  {
    id: 'fallback-interview',
    slug: 'job-interview',
    prompt: 'Emotional support for a job interview. Who do you bring?',
    shortLabel: 'INTERVIEW',
    category: 'comedy',
    categoryColor: '#F8D030',
  },
  {
    id: 'fallback-bully',
    slug: 'school-bully',
    prompt: 'If they were both human, which one was definitely the school bully?',
    shortLabel: 'BULLY',
    category: 'comedy',
    categoryColor: '#F8D030',
  },
  {
    id: 'fallback-barfight',
    slug: 'bar-fight',
    prompt: 'Bar fight just broke out. Who is watching your back?',
    shortLabel: 'BAR FIGHT',
    category: 'battle',
    categoryColor: '#F08030',
  },
];

export function getDailyQuestion(questions = FALLBACK_QUESTIONS) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
  const diff = now - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return questions[dayOfYear % questions.length];
}
