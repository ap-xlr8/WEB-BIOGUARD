import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';

export default function PagoExitosoPage() {
    const { refreshPlan, user } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verificando' | 'confirmado' | 'timeout'>('verificando');
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const previousPlan = useRef(user?.plan);

    useEffect(() => {
        let attempts = 0;
        const MAX_ATTEMPTS = 10;
        const INTERVAL_MS = 3000;

        pollingRef.current = setInterval(async () => {
            attempts++;
            try {
                await refreshPlan();
                // Verificar si el plan cambió
                if (user?.plan && user.plan !== previousPlan.current) {
                    setStatus('confirmado');
                    clearInterval(pollingRef.current!);
                    setTimeout(() => navigate('/app/dashboard'), 2000);
                    return;
                }
            } catch { /* continuar */ }

            if (attempts >= MAX_ATTEMPTS) {
                clearInterval(pollingRef.current!);
                setStatus('timeout');
            }
        }, INTERVAL_MS);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [refreshPlan, navigate, user?.plan]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
            {status === 'verificando' && (
                <>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                    <h1 className="text-2xl font-bold">Verificando tu pago...</h1>
                    <p className="text-muted-foreground text-center">
                        Estamos confirmando tu suscripción. Esto puede tomar unos segundos.
                    </p>
                </>
            )}
            {status === 'confirmado' && (
                <>
                    <div className="text-6xl">✅</div>
                    <h1 className="text-2xl font-bold text-green-600">¡Pago confirmado!</h1>
                    <p className="text-muted-foreground">Tu plan ha sido actualizado. Redirigiendo...</p>
                </>
            )}
            {status === 'timeout' && (
                <>
                    <div className="text-6xl">⏳</div>
                    <h1 className="text-2xl font-bold">Pago en proceso</h1>
                    <p className="text-muted-foreground text-center">
                        El pago puede tardar unos minutos en procesarse. 
                        Tu plan se actualizará automáticamente.
                    </p>
                    <button
                        onClick={() => navigate('/app/dashboard')}
                        className="btn-primary"
                    >
                        Ir al dashboard
                    </button>
                </>
            )}
        </div>
    );
}
