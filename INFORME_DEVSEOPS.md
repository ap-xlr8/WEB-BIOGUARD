# Informe DevSecOps — WEB-BIOGUARD (Frontend Web)

**Fecha:** 2026-08-10
**Repo:** `ap-xlr8/WEB-BIOGUARD` · **Rama:** `main`
**Stack:** React 18 + TypeScript + Vite, Nginx, Render

---

## 1. Exposición de información sensible

**Veredicto: NO se encontraron credenciales reales** en archivos versionados ni en el historial git.

| Elemento | Estado |
|---|---|
| `.env` (local) | OK — **gitignored** (`.gitignore:23`) y NO versionado. Solo valores públicos `VITE_*`: `VITE_API_URL` y `VITE_STRIPE_PUBLIC_KEY` (`pk_test_…`, publicable por diseño) |
| `.env.example` | OK — plantilla correcta, solo `VITE_*` |
| Claves Stripe secretas (`sk_*`) | ✅ Ninguna |
| Claves Firebase / FCM / VAPID | ✅ No implementado; solo stubs (`src/services/pushNotificationService.ts:24`) |
| Tokens hardcodeados | ✅ Ninguno |
| `.dockerignore` | OK — excluye `.env` y `.env.*` (con excepción `.env.example`) |

**Notas:**
- `VITE_STRIPE_PUBLIC_KEY` está definida pero **no se referencia en ningún lado de `src/`** (config muerta). Eliminar o documentar como reservada.
- Firebase, cuando se integre, debe usar solo claves públicas `VITE_*`; nunca claves de servidor FCM.

---

## 2. CI/CD — DevSecOps

### `.github/workflows/ci.yml`
- `permissions: contents: read` (mínimo). Acciones ancladas por SHA.
- **`npm audit --audit-level=moderate`** (falla el CI ante moderadas+), lint `--max-warnings=0`, tests con cobertura, e2e Playwright, build, SBOM (`npm sbom`), artefactos `web-evidence`.

### `.github/workflows/security.yml`
- **CodeQL** (javascript-typescript), **dependency-review** (PR, fail moderate), **Gitleaks** (fetch-depth 0), **Trivy** (container, fail CRITICAL/HIGH). Programado semanal.

### Dependabot (`.github/dependabot.yml`)
- Ecosistemas: npm, docker, github-actions — semanal. Grupo `frontend-security`.
- **A mejorar:** sin `reviewers` ni `labels`.

**Observaciones:** el despliegue lo gestiona Render (`autoDeployTrigger: checksPass`); no usa GitHub Environments. Falta `osv-scanner`/`npm audit signatures` como capa extra. Los artefactos `dist/` se suben con `if: always()` (accesibles a quien tenga lectura).

---

## 3. Dockerfile + Nginx

- **Dockerfile:** multi-stage, base anclada por **digest SHA-256** (node:24-alpine + nginx-unprivileged:stable-alpine), usuario **no-root**, `npm ci --ignore-scripts`, sin secretos en imagen. **Sin HEALTHCHECK** (cubierto por `render.yaml` → `/web-health`).
- **`docker/nginx.conf` — cabeceras de seguridad completas:**
  - `Content-Security-Policy` (`default-src 'self'`, `script-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`, sin `'unsafe-eval'`; `'unsafe-inline'` solo en styles).
  - `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
  - Proxy `/api/`, websockets `/hubs/`, `proxy_hide_header Server`.
  - ⚠️ CSP `connect-src` **hardcodea el dominio DigitalOcean** → si cambia `API_UPSTREAM`, rompe las llamadas (funcional).
  - ⚠️ `firebase-messaging-sw.js` (service worker) se sirve con `expires 1y` → debe ser `no-cache`/`max-age=0`.
  - Sin rate-limiting en nginx.

---

## 4. Seguridad de la aplicación

**Bien implementado:**
- **Access token JWT solo en memoria** (`src/utils/session.ts`); **refresh por cookie httpOnly** + cabecera `X-XSRF-TOKEN` + `withCredentials`; auto-logout 15 min; flujo 2FA; logout que notifica al servidor.
- **Nada de `dangerouslySetInnerHTML`, `eval`, `new Function`** en `src/`; TS `strict: true`; sin `any`.
- Guards de ruta con RBAC (UX; la API es la autoridad final).
- **Stripe:** sin claves en front; pago delegado al backend; `Checkout.tsx:44-47` valida que la URL sea `https` + hostname exacto `checkout.stripe.com`.
- Solo se exponen variables `VITE_*`; `VITE_API_URL=''` → proxy same-origin de Nginx (evita CORS en prod).

**A mejorar:**
- Perfil de usuario (nombre, rol, plan) en `localStorage` bajo `bioguard_user` (sin token) — riesgo residual ante XSS.
- `getErrorMessage` muestra el `message` del backend en la UI — asegurar que el backend no filtre detalles internos.
- ESLint sin reglas de seguridad (p. ej. `eslint-plugin-security`, `react/no-danger`, `no-secrets`).

---

## 5. Dependencias

- `package-lock.json` **versionado** (builds reproducibles con `npm ci`).
- React 18.3.1 (última de la línea 18; evaluar React 19), Vite 8.2.1, axios 1.19.0, react-router-dom 7.18.2, TypeScript 5.6.3.
- Sin `firebase` ni `@stripe/stripe-js` (coherente con el diseño).

---

## 6. Priorización

| # | Severidad | Acción |
|---|---|---|
| 1 | Media | Hacer dinámica la CSP `connect-src` (según `API_UPSTREAM`) o alinearla al dominio real |
| 2 | Media | Servir `firebase-messaging-sw.js` con `no-cache`/`max-age=0` |
| 3 | Baja | Añadir `HEALTHCHECK` al Dockerfile; `gzip_vary on` |
| 4 | Baja | Dependabot: configurar `reviewers`/`labels`; añadir `osv-scanner` |
| 5 | Baja | Eliminar `VITE_STRIPE_PUBLIC_KEY` (sin uso) o documentarla |
| 6 | Baja | Reforzar ESLint con reglas de seguridad; revisar exposición de `message` del backend |
| 7 | Info | Verificar que el repo sea privado y configurar protección de rama + environments |
