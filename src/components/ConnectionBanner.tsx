import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function ConnectionBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online) return null;

  return (
    <div role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-warning-bg)', borderBottom: '1px solid var(--color-warning)', color: 'var(--color-text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
      <WifiOff size={16} aria-hidden="true" /> Sin conexión. La Web conservará la vista actual, pero no puede actualizar datos del backend.
    </div>
  );
}
