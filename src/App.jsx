import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, NavLink } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Arena } from './components/Arena/Arena.jsx';
import { ResultCard } from './components/Results/ResultCard.jsx';
import { Leaderboard } from './components/Leaderboard/Leaderboard.jsx';
import { trackPageView } from './analytics.js';

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <PageTracker />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Arena />} />
          <Route path="/results" element={<ResultCard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Arena />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
