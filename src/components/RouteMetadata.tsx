import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const metadata: Record<string, { title: string; description: string }> = {
  '/': { title: 'BioGuard | Monitoreo preventivo conectado', description: 'Ecosistema Wear OS, móvil y web con operación offline y sincronización controlada.' },
  '/caracteristicas': { title: 'Cómo funciona | BioGuard', description: 'Conoce el flujo Wearable, móvil offline, backend e histórico Web de BioGuard.' },
  '/licenciamientos': { title: 'Planes | BioGuard', description: 'Consulta precios y capacidades vigentes directamente desde el servicio de planes.' },
  '/faq': { title: 'Ayuda | BioGuard', description: 'Respuestas sobre conectividad, señales disponibles, pagos y alcance clínico de BioGuard.' },
  '/contacto': { title: 'Contacto | BioGuard', description: 'Registra y consulta solicitudes de soporte asociadas a tu cuenta BioGuard.' },
  '/login': { title: 'Iniciar sesión | BioGuard', description: 'Acceso protegido al panel de BioGuard.' },
  '/registro': { title: 'Crear cuenta | BioGuard', description: 'Registro de una cuenta BioGuard y verificación de identidad.' },
  '/dashboard': { title: 'Panel | BioGuard', description: 'Resumen autorizado de paciente, sincronización y métricas.' },
  '/salud': { title: 'Análisis y reportes | BioGuard', description: 'Histórico, tendencias, eventos y reportes sincronizados.' },
  '/seguridad': { title: 'Seguridad | BioGuard', description: 'Cuidadores, accesos y auditoría de la cuenta.' },
};

export function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const current = metadata[pathname] ?? { title: 'BioGuard', description: 'Plataforma de monitoreo preventivo conectado.' };
    document.title = current.title;
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = current.description;
  }, [pathname]);

  return null;
}
