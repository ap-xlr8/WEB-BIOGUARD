# Documento técnico del Frontend Web BioGuard

## 1. Objetivo

La Web consulta y administra información histórica ya sincronizada con el backend. No recibe telemetría directamente del wearable y no sustituye a la aplicación móvil. El flujo de datos soportado es:

```text
Wearable --Bluetooth--> Móvil --lotes pendientes/Internet--> Backend <--HTTPS--> Web
```

BioGuard es una herramienta preventiva de monitoreo. La interfaz no debe presentar una lectura ausente como normal ni comunicar diagnósticos médicos no respaldados.

### Topología de despliegue acordada

- El backend derivado se despliega en Render y sirve como ambiente de pruebas antes de integrar cambios al backend original.
- El backend original de producción permanece en DigitalOcean.
- Móvil y Wearable se distribuyen inicialmente como APK; Móvil conserva los endpoints de DigitalOcean y Wearable se comunica exclusivamente con Móvil por Bluetooth.
- La Web se desplegará en Render. Su contenedor usa `API_UPSTREAM` para seleccionar backend sin recompilar la aplicación.

## 2. Arquitectura

```text
src/
  components/       Componentes globales y layouts
  constants/        Rutas y claves estables
  context/          Sesión y tema
  hooks/            Consultas reutilizables
  pages/
    public/          Marketing, ayuda, legal y pagos
    auth/            Acceso, registro y recuperación
    app/             Panel del usuario
    admin/           Operación administrativa
  routes/            Router y guardas RBAC
  services/          Contratos HTTP por dominio
  test/              Configuración de pruebas
  types/             DTOs TypeScript
  utils/             HTTP, sesión y normalización de errores
e2e/                 Pruebas Playwright y Axe
docker/              Configuración Nginx
.github/workflows/   CI y DevSecOps
```

Las páginas son cargadas bajo demanda. React Query gobierna datos remotos y cache; el estado de autenticación vive en `AuthContext`; el access token solo vive en memoria.

## 3. Pila tecnológica

| Capa | Tecnología |
|---|---|
| UI | React 18 + TypeScript |
| Build | Vite 8 |
| Rutas | React Router 7 |
| Datos remotos | TanStack React Query 5 + Axios |
| Gráficas | Recharts 3 |
| Iconos | Lucide React |
| QR | qrcode.react |
| PDF | jsPDF, cargado bajo demanda |
| Unitarias | Vitest + Testing Library + jsdom |
| E2E | Playwright + Axe |
| Runtime | Nginx no privilegiado en contenedor multi-stage |

## 4. Seguridad

- `accessToken` se conserva únicamente en memoria para reducir exposición ante persistencia local.
- El refresh se solicita mediante cookie y `withCredentials`; solicitudes 401 comparten una sola promesa de renovación.
- Cierre de sesión y fallo de refresh limpian la sesión local y notifican a la aplicación.
- Las rutas privadas exigen sesión; las administrativas exigen rol `administrador`.
- La URL de Stripe se valida por protocolo y hostname antes de navegar fuera del sitio.
- Nginx aplica HSTS, CSP, `nosniff`, `DENY`, política de referencia, aislamiento de origen y permisos restrictivos.
- El pipeline ejecuta audit de dependencias, CodeQL, Gitleaks, dependency review, Trivy y genera SBOM.

El backend debe volver a validar rol, propietario del recurso, estado de cuenta y alcance en cada operación. Ocultar una ruta en React no es un control de autorización suficiente.

## 5. UX

- La portada explica primero el producto y deja visible la continuidad del contenido.
- Navegación consistente con encabezado público, sidebar privado y encabezado de aplicación.
- Estados explícitos para carga, error, ausencia de datos, desconexión de Internet y sesión no autorizada.
- Las acciones no implementadas por el backend no se simulan.
- Los datos clínicos desconocidos se muestran como `--` o “no disponible”.
- El diseño funciona con tema claro y oscuro; la preferencia se conserva localmente.

## 6. Sistema visual

El sistema usa variables CSS para fondos, texto, bordes, estados, espaciado, sombras y radios. Los controles y tarjetas usan radios máximos de 8 px, tipografía del sistema, `letter-spacing: 0`, foco visible y colores de estado no dependientes de un único tono. Los iconos de interfaz proceden de Lucide.

## 7. Mapa del sitio

### Público

`/`, `/caracteristicas`, `/licenciamientos`, `/faq`, `/contacto`, `/nosotros`, `/recursos`, `/status`, `/terminos`, `/privacidad`, `/cookies`, `/aviso-legal`.

### Autenticación y pagos

`/login`, `/registro`, `/confirmar-correo`, `/recuperar-password`, `/reset-password`, `/checkout`, `/configuracion-completada`, `/pago-exito`, `/pago-cancelado`.

### Aplicación

`/dashboard`, `/salud`, `/seguridad`, `/facturacion`, `/ajustes`, `/soporte`.

### Administración

`/admin/dashboard`, `/admin/usuarios`, `/admin/tickets`.

Toda ruta desconocida muestra una vista 404. Las páginas privadas no se indexan mediante `robots.txt`.

## 8. Inventario funcional

| Dominio | Vistas | Función |
|---|---|---|
| Producto | Inicio, características, licenciamientos | Comunicar alcance real y consultar planes |
| Confianza | FAQ, recursos, nosotros, estado, legales | Ayuda, transparencia y términos |
| Identidad | Login, registro, 2FA, recuperación | Ciclo de identidad web |
| Monitoreo | Dashboard, salud | Resumen e histórico procedente del backend |
| Gestión | Seguridad, ajustes, soporte | Paciente, cuidadores, cuenta y tickets |
| Comercial | Checkout, resultados, facturación | Sesión Stripe e historial backend |
| Administración | Métricas, usuarios, tickets | Operación restringida por rol |

## 9. APIs consumidas

| Dominio | Familias de endpoints |
|---|---|
| Identidad | `/api/Auth/*`, `/api/UsuariosWeb/*` |
| Pacientes | `/api/Pacientes/*`, QR, biometría y dispositivo |
| Cuidadores | `/api/Cuidadores/*` y regeneración de QR |
| Salud | `/api/Sensores/*`, `/api/Reportes/*`, `/api/ML/*` |
| Medicación | `/api/Medicamentos/*` |
| Pagos | `/api/Planes`, `/api/Pagos/*` |
| Operación | `/api/Tickets/*`, `/api/Admin/*`, `/api/Auditoria` |

Todas las llamadas pasan por `src/utils/httpClient.ts`, salvo la renovación aislada que evita recursión del interceptor.

## 10. Dashboard

El dashboard obtiene paciente, estadísticas, tendencia, eventos, medicamentos y tracking del backend. No contiene coordenadas, lecturas o códigos alternativos de demostración. Ante ausencia de paciente muestra creación; ante ausencia de una métrica preserva el estado desconocido. Las gráficas usan `timestamp` como eje temporal.

## 11. RBAC

| Rol | Área prevista |
|---|---|
| `administrador` | Panel administrativo |
| `dueno` | Panel de monitoreo y gestión asignada |
| `cuidador` | Paciente vinculado, salud y tareas permitidas |
| `paciente` | Información propia permitida por backend |

`AdminRoute` impide entrar al panel administrativo sin rol. `ProtectedRoute` exige sesión. La API es responsable de impedir acceso horizontal o elevación de privilegios.

## 12. Componentes globales

`Navbar`, `Footer`, `PublicLayout`, `AuthLayout`, `AppLayout`, `Sidebar`, `Header`, `ConnectionBanner`, `RouteMetadata`, `ErrorBoundary`, `Button`, `Input`, `Logo`, `Skeleton`, `Toast` y `PacienteModal`.

## 13. Formularios

Los campos compartidos enlazan `label` con `input`, anuncian errores mediante `aria-describedby`, exponen `aria-invalid` y usan autocomplete donde corresponde. Los botones presentan estados de carga. Los errores mostrados al usuario se normalizan y no exponen trazas internas.

## 14. Responsive

La superficie pública se prueba en Chromium de escritorio y emulación Pixel 7. Los layouts evitan overflow horizontal, el menú móvil declara su estado con `aria-expanded` y los controles mantienen dimensiones estables. Las vistas autenticadas requieren una segunda matriz E2E con fixtures de staging.

## 15. Estados

- Carga: spinner o skeleton con semántica `status`.
- Vacío: texto y acción contextual sin inventar datos.
- Error: mensaje seguro y posibilidad de reintento cuando aplica.
- Offline: banner global; la vista actual permanece y las operaciones remotas se consideran no disponibles.
- No autorizado: renovación de sesión o redirección al login.
- No encontrado: página 404 pública.

## 16. SEO

`RouteMetadata` actualiza título y descripción por ruta. `index.html` define metadata base, Open Graph, Twitter, `robots` y color de navegador. El dominio final debe incorporarse antes del lanzamiento para `canonical`, `og:url` y `sitemap.xml`.

## 17. Accesibilidad

Se aplican HTML semántico, navegación por teclado, foco visible, nombres accesibles, regiones vivas, contraste de texto AA y controles nativos. Playwright ejecuta Axe sobre la portada en escritorio y móvil. Antes de producción regulada se exige evaluación manual WCAG 2.2 AA.

## 18. Rendimiento

- Rutas separadas por chunks con `lazy`.
- Logo optimizado y variante recortada para navegación.
- jsPDF se descarga solo al exportar.
- Nginx sirve assets versionados con cache inmutable y comprime recursos textuales.
- La CI produce build de producción; se recomienda añadir presupuesto Lighthouse tras definir URL de staging.

## 19. Testing y CI/CD

Comandos locales:

```bash
npm ci
npm run lint -- --max-warnings=0
npm run test:coverage
npm run test:e2e
npm run build
npm audit --audit-level=moderate
```

`ci.yml` ejecuta calidad, cobertura, E2E, build y SBOM. `security.yml` añade CodeQL, dependency review, detección de secretos y escaneo de contenedor. Las acciones están fijadas por SHA y los permisos del workflow se limitan explícitamente.

## 20. Flujos de navegación

### Usuario nuevo

`Inicio -> Registro -> Verificación -> Login/2FA -> Plan -> Stripe -> Configuración -> Dashboard`.

### Usuario existente

`Login -> restauración mediante refresh cookie -> Dashboard` o `Admin Dashboard` según rol.

### Recuperación

`Login -> Recuperar contraseña -> enlace/token backend -> Restablecer -> Login`.

### Monitoreo

`Dashboard -> Salud/Histórico -> Seguridad/Cuidadores -> Ajustes o Soporte`.

### Pago

`Licenciamientos -> Checkout autenticado -> Stripe oficial -> retorno -> verificación con historial backend`.

## Roadmap de salida

1. Contratos y E2E autenticados contra staging.
2. Pentest, autorización por objeto y pruebas de abuso/rate limit en backend.
3. Revisión manual WCAG y visual de todas las vistas privadas.
4. Dominio, TLS, CORS, cookies, canonical, sitemap, observabilidad y CSP reporting.
5. Prueba de carga, recuperación, rollback y restauración.
6. Aprobaciones legal, privacidad, riesgo y clínica antes de usar datos reales.
7. Para las APK: firma de release protegida, versionado, hash SHA-256, canal autenticado de descarga, procedimiento de actualización y migración posterior a Google Play App Signing.
