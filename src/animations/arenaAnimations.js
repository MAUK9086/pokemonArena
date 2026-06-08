// Framer Motion variants — centralized so all Arena components stay in sync.

export const pokemonSlotVariants = {
  hidden: (side) => ({
    opacity: 0,
    x: side === 'left' ? -100 : 100,
    scale: 0.85,
  }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 26, duration: 0.35 },
  },
  exit: (side) => ({
    opacity: 0,
    x: side === 'left' ? 60 : -60,
    y: 30,
    scale: 0.7,
    transition: { duration: 0.25, ease: 'easeIn' },
  }),
};

export const winnerPulseVariants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.12, 1],
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const championRetireVariants = {
  retire: {
    y: [0, -20, 0],
    scale: [1, 1.18, 1],
    rotate: [0, -4, 4, 0],
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
};

export const vsDividerVariants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.25, 1],
    transition: { duration: 0.25 },
  },
};

export const streakBadgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};

export const resultCardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

export const resultCardItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 22 },
  },
};

export const swipeHintVariants = {
  idle: { opacity: 1 },
  wiggle: {
    x: [-8, 8, -5, 5, 0],
    opacity: [1, 0.7, 1, 0.7, 1],
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 2.5 },
  },
};

export const leaderboardRowVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, type: 'spring', stiffness: 200 },
  }),
};

export const bgTransitionConfig = { duration: 0.4, ease: 'easeInOut' };

export const loadingFadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};
