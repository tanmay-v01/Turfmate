import { useEffect, useRef, useCallback } from 'react';

export function useGameTimer(game, setGame) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (game?.timerRunning) {
      intervalRef.current = setInterval(() => {
        setGame((prev) => prev ? { ...prev, timerSeconds: prev.timerSeconds + 1 } : prev);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [game?.timerRunning, setGame]);

  const toggle = useCallback(() => {
    setGame((prev) => prev ? { ...prev, timerRunning: !prev.timerRunning } : prev);
  }, [setGame]);

  const reset = useCallback(() => {
    setGame((prev) => prev ? { ...prev, timerSeconds: 0, timerRunning: false } : prev);
  }, [setGame]);

  return { toggle, reset };
}
