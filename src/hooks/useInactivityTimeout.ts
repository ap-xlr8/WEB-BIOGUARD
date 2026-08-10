import { useCallback, useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos (Nivel de Seguridad Bancaria/Fintech)

export function useInactivityTimeout(isAuthenticated: boolean, onTimeout: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isAuthenticated) {
      timerRef.current = setTimeout(() => {
        console.warn('Sesión cerrada por inactividad prolongada (15 minutos).');
        onTimeout();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [isAuthenticated, onTimeout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Iniciar temporizador
    resetTimer();

    // Resetear temporizador ante cualquier evento del usuario
    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, resetTimer]);
}
