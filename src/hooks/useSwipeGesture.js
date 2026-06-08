import { useDrag } from '@use-gesture/react';

export function useSwipeGesture({ onPickLeft, onPickRight, disabled = false }) {
  const bind = useDrag(
    ({ last, movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (!last || disabled) return;
      const isSwipe = Math.abs(mx) > 80 || Math.abs(vx) > 0.5;
      if (!isSwipe) return;
      if (dx < 0) onPickRight?.(); // swipe left → pick right pokemon
      if (dx > 0) onPickLeft?.();  // swipe right → pick left pokemon
    },
    { filterTaps: true, axis: 'x' }
  );

  return { bind };
}
