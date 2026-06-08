import { create } from 'zustand';

export const useLeaderboardStore = create((set) => ({
  tab: 'top',
  topElo: [],
  controversial: [],
  onStreak: [],
  loading: false,
  lastUpdated: null,
  questionId: null,

  actions: {
    setTab: (tab) => set({ tab }),
    setLoading: (loading) => set({ loading }),
    setData: ({ topElo, controversial, onStreak, questionId }) =>
      set({ topElo, controversial, onStreak, questionId, loading: false, lastUpdated: Date.now() }),
    clearData: () => set({ topElo: [], controversial: [], onStreak: [], loading: true }),
  },
}));
