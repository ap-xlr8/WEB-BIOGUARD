# BioGuard Web

Consola web de monitoreo histórico y administración de BioGuard. La Web consulta datos que la aplicación móvil ya sincronizó con el backend; no recibe telemetría directamente del wearable.

## Topología de entornos

| Componente | Entorno actual | Destino |
|---|---|---|
| Backend derivado | Pruebas antes de integrar al original | Render |
| Backend original | Producción | DigitalOcean |
| Aplicación móvil | Distribución temporal por APK | Backend original en DigitalOcean |
| Wearable | Distribución temporal por APK | Solo Móvil mediante Bluetooth |
| Web | Pendiente de despliegue | Render |

Por defecto, el contenedor de la Web dirige `/api`, `/health` y `/hubs` al backend original de DigitalOcean. Para desplegar una instancia Web de pruebas contra el backend derivado, se cambia únicamente `API_UPSTREAM` en Render. No se modifica el código ni la configuración de la aplicación móvil.

## Requisitos

- Node.js 24
- npm compatible con el lockfile
- Chromium de Playwright para pruebas E2E
- Docker únicamente para construir o ejecutar el contenedor

## Desarrollo local

```bash
npm ci
npm run dev
```

Vite publica la aplicación en `http://localhost:5173` y usa el proxy local definido en `vite.config.ts`. `VITE_API_URL` puede establecerse para apuntar directamente a un backend concreto, pero nunca debe contener secretos.

## Validación

```bash
npm run lint -- --max-warnings=0
npm run test:coverage
npm run test:e2e
npm run build
npm audit --audit-level=moderate
```

## Despliegue Web en Render

El repositorio incluye `render.yaml` y un contenedor multi-stage. El servicio escucha en el puerto `8080`, expone `/web-health` para comprobar exclusivamente el frontend y conserva `/health` para consultar el backend desde la vista de estado.

Variables del servicio:

```env
PORT=8080
API_UPSTREAM=https://bioguard-api-lkvnq.ondigitalocean.app
```

Para un Web preview conectado al backend de pruebas en Render:

```env
API_UPSTREAM=https://NOMBRE-DEL-BACKEND-DE-PRUEBAS.onrender.com
```

El navegador siempre llama al mismo origen de la Web. Nginx realiza el proxy hacia el backend elegido, lo que simplifica CORS y permite una CSP `connect-src 'self'`.

La publicación automática usa `checksPass`: Render solo debe desplegar después de que CI haya aprobado lint, pruebas, build y controles configurados en GitHub.

## Variables Vite

`VITE_API_URL` queda vacío en el contenedor para usar el proxy same-origin. `VITE_APP_URL` se reserva para la URL pública final y `VITE_STRIPE_PUBLIC_KEY` solo admite una clave publicable. Ninguna credencial privada debe incluirse en variables `VITE_*` porque forman parte del bundle público.

## Seguridad y operación

- El access token se mantiene en memoria y el refresh depende de cookie segura emitida por el backend.
- Nginx agrega CSP, HSTS, protección contra framing, `nosniff` y políticas restrictivas.
- La API debe permitir el origen final de Render si alguna integración evita el proxy.
- El dominio final debe agregarse a redirect URLs, cookies y configuración Stripe del backend original.
- Las APK deben estar firmadas, versionadas y distribuirse con SHA-256 publicado por un canal autenticado hasta migrar a Google Play.

Consulta [DOCUMENTACION_FRONTEND_WEB.md](./DOCUMENTACION_FRONTEND_WEB.md) y [AUDITORIA_CUMPLIMIENTO_FRONTEND_WEB_2026-08-09.md](./AUDITORIA_CUMPLIMIENTO_FRONTEND_WEB_2026-08-09.md) para arquitectura, pruebas y bloqueadores de liberación.
