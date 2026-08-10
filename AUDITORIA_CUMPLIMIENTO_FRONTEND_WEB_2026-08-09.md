# Auditoría de cumplimiento del Frontend Web

Fecha de corte: 2026-08-09  
Alcance: `FrontendWebBioGuard`  
Referencia: Documento Maestro Frontend Web entregado por el propietario.

## Dictamen ejecutivo

El frontend ya tiene una base publicable y verificable: arquitectura modular, navegación pública/privada, RBAC del lado cliente, sesión con access token en memoria, refresh cookie, estados de carga/error/vacío, interfaz responsive, CI, análisis DevSecOps, pruebas unitarias, cobertura y E2E con accesibilidad automática.

No debe declararse todavía como un producto bancario, clínicamente certificado o listo para una publicación regulada. La seguridad real depende también del backend, la infraestructura, la operación, las políticas organizacionales y auditorías externas. Antes de liberar a producción deben cerrarse los bloqueadores de la sección final.

La topología confirmada separa el backend derivado de pruebas en Render del backend original productivo en DigitalOcean. La Web se publicará en Render y selecciona el destino mediante `API_UPSTREAM`; la aplicación móvil continúa consumiendo DigitalOcean y no se altera por esta configuración.

## Matriz de las 20 áreas

| Área del documento maestro | Estado | Evidencia actual | Observación |
|---|---|---|---|
| Objetivo general | Cumple | Landing y características describen Wearable -> Móvil -> Backend -> Web | Se eliminaron afirmaciones técnicas no demostradas |
| Arquitectura | Cumple | React por páginas, layouts, servicios, contextos, hooks y utilidades | Las páginas se cargan con `lazy` |
| Pila tecnológica | Cumple | React 18, TypeScript, Vite, React Router, React Query, Axios, Recharts | Dependencias declaradas en `package.json` |
| Seguridad frontend | Parcial alto | Token de acceso en memoria, refresh por cookie, guardas, CSP, cabeceras Nginx | RBAC autoritativo y controles de objeto deben validarse en API |
| UX | Cumple en flujos auditados | Navegación, feedback, vacíos, errores, banner offline y 404 | Falta una prueba moderada con usuarios reales |
| Diseño UI | Cumple base | Tokens, tema claro/oscuro, iconos Lucide, responsive | Persisten estilos heredados en vistas privadas que conviene unificar |
| Mapa del sitio | Cumple | Rutas públicas, autenticación, app y administración | Inventario real documentado abajo |
| Inventario de vistas | Cumple | 31 páginas TSX y layouts reutilizables | Algunas funciones dependen de contratos backend limitados |
| Consumo de APIs | Cumple | Cliente Axios central, timeout, refresh serializado, React Query | Falta E2E contra un ambiente staging aislado |
| Dashboard | Cumple sin datos demo | Sensores, eventos y tracking proceden del backend | Los valores ausentes se muestran como `--` o estado no disponible |
| RBAC | Parcial alto | `ProtectedRoute`, `AdminRoute` y navegación por rol | El frontend no sustituye autorización en servidor |
| Componentes globales | Cumple | Navbar, Footer, Sidebar, Header, Input, Button, Toast, Skeleton, ErrorBoundary | Reutilización efectiva en layouts |
| Formularios | Cumple base | Labels, errores asociados, autocomplete y estados de envío | Falta homogeneizar focus trap en algunos modales heredados |
| Responsive | Cumple en alcance público | E2E Chromium desktop y Pixel 7, sin overflow | Requiere matriz física adicional para vistas autenticadas |
| Estados de aplicación | Cumple | Loading, error, vacío, online/offline, sesión expirada y 404 | Los estados dependen de respuestas consistentes de la API |
| SEO | Parcial | Metadata por ruta, Open Graph, Twitter y robots | Faltan canonical y sitemap hasta conocer el dominio final |
| Accesibilidad | Cumple automático público | Axe WCAG 2 A/AA sin infracciones en portada desktop/móvil | No equivale a auditoría manual WCAG completa |
| Rendimiento | Cumple base | Lazy routes, assets optimizados, cache estático y build por chunks | Falta presupuesto Lighthouse en infraestructura de producción |
| Testing | Cumple base alta | 16 unitarias; 7 E2E aprobadas y 1 omitida por proyecto no aplicable | Falta integración autenticada con backend staging |
| Flujo de navegación | Cumple | Redirección por sesión/rol, pagos, recuperación y rutas legales | Stripe solo redirige a hostname oficial validado |

## Correcciones relevantes realizadas

- Se reconstruyó la portada para explicar el funcionamiento real, sin telemetría, precios, coordenadas o indicadores ficticios.
- Se implementó navegación móvil accesible y rutas independientes para características, recursos, estado, privacidad, términos, cookies y aviso legal.
- Se corrigió el rol `dueno`, que antes podía recibir un dashboard incompleto.
- Se retiró la periodicidad anual inventada: el checkout ahora respeta el contrato mensual disponible en el backend.
- Se eliminó la opción PayPal simulada y se valida que Stripe redirija exclusivamente a `https://checkout.stripe.com`.
- El QR de configuración ahora procede de `/api/Pacientes/{id}/qr`; ya no se genera un código aleatorio.
- El dashboard no inventa GPS, identificadores de paciente, riesgo normal ni sensores saludables.
- Soporte y administración ya no simulan respuestas o cambios de estado que el backend no implementa.
- Las notificaciones se marcan como leídas mediante el endpoint real.
- La foto de perfil dejó de persistirse como base64 en `localStorage`.
- Se corrigieron etiquetas, relaciones de errores, foco visible y contraste WCAG AA en la superficie pública.
- Se incorporaron pruebas unitarias, Playwright, Axe, CI, CodeQL, dependency review, Gitleaks, Trivy y SBOM CycloneDX.

## Riesgos y bloqueadores antes de producción

1. Ejecutar pruebas de contrato y E2E autenticadas contra un backend de staging con datos sintéticos controlados; no usar información clínica real en QA.
2. Verificar en el backend RBAC por endpoint y autorización por objeto para impedir IDOR entre pacientes, cuidadores y administradores.
3. Configurar dominio final, TLS, CORS, cookies `Secure`/`HttpOnly`/`SameSite`, canonical, sitemap, observabilidad y gestión de secretos en el entorno real.
4. Completar revisión legal y de privacidad para jurisdicciones objetivo, retención de datos, consentimiento, incidentes y derechos ARCO.
5. Realizar pentest externo, modelado de amenazas y prueba de restauración/continuidad. Un pipeline no certifica “seguridad bancaria”.
6. Validar contratos de pagos mediante webhooks idempotentes del backend. La página de éxito no debe ser fuente de verdad del pago.
7. Completar pruebas manuales WCAG 2.2 AA: teclado, lector de pantalla, zoom 200/400 %, reflow, contraste no textual y modales privados.
8. Homogeneizar estilos heredados de las vistas privadas en tema claro y ejecutar pruebas visuales autenticadas en dispositivos físicos.
9. Definir SLO/SLI, alertas, CSP reporting, versionado de releases, rollback y aprobación de despliegue.
10. Validar la imagen de contenedor en CI. En esta estación no se pudo ejecutar Docker porque el daemon local no estaba disponible.
11. Para la distribución temporal por APK, establecer firma de release, custodia de la clave, hashes verificables, canal autenticado, inventario de versiones y política de actualización obligatoria ante vulnerabilidades.

## Criterio de liberación

La publicación debe autorizarse únicamente cuando los puntos 1 a 7 estén cerrados con evidencia y responsables. El frontend por sí solo no puede garantizar un estándar bancario o clínico; sí puede y debe demostrar controles técnicos, trazabilidad y ausencia de afirmaciones falsas, que es lo implementado en este alcance.
