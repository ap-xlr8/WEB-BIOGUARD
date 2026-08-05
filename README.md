# 🌐 BioGuard — Plataforma Web Frontend

BioGuard Web es la consola administrativa y de monitoreo centralizada en tiempo real diseñada para dueños de pacientes, profesionales de la salud y cuidadores. Esta aplicación cliente React basada en Vite se conecta de forma segura a la API REST del backend BioGuard para ofrecer visualización biométrica, gestión de alertas, asignación de cuidadores y control de suscripciones.

---

## 🚀 Tecnologías Principales

* **Core**: React 18, TypeScript, Vite.
* **Estilos**: Vanilla CSS con diseño responsivo, temas oscuros y componentes modernos.
* **Enrutamiento**: React Router DOM v6.
* **Cliente HTTP**: Axios con interceptores JWT y cancelación de peticiones con `AbortController`.
* **Procesamiento de Pagos**: Stripe JS (`@stripe/stripe-js`, `@stripe/react-stripe-js`).
* **Visualización de Datos**: Recharts / Chart.js para gráficas biométricas en tiempo real e históricas.
* **Manejo de Errores**: React ErrorBoundary global y estados de fallo asíncronos controlados.

---

## 🛠️ Requisitos Previos e Instalación

### Prerrequisitos
* Node.js v18.0 o superior
* npm v9.0 o superior

### Instalación

1. Clonar el repositorio y navegar al directorio del frontend:
   ```bash
   cd FrontendWebBioGuard
   ```

2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del directorio `FrontendWebBioGuard/` tomando como base el archivo `.env.example`:

```env
# URL Base de la API REST del Backend (Producción / Desarrollo)
VITE_API_URL=https://bioguard-api-lkvnq.ondigitalocean.app

# Clave Pública de Stripe para Procesamiento de Pagos
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_sample_key_here
```

> ⚠️ **Seguridad**: Nunca incluyas claves secretas del servidor (`STRIPE_SECRET_KEY`, cadenas de conexión de base de datos) en este repositorio. Las variables con prefijo `VITE_` son expuestas públicamente en el cliente por diseño.

---

## 📜 Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

* `npm run dev`: Inicia el servidor de desarrollo local con Vite (por defecto en `http://localhost:5173`).
* `npm run build`: Compila el código TypeScript y genera el bundle optimizado para producción en la carpeta `dist/`.
* `npm run preview`: Previsualiza localmente el build de producción generado.
* `npx tsc --noEmit`: Ejecuta la verificación estática de tipos TypeScript sin emitir archivos.

---

## 📂 Arquitectura del Proyecto

```
FrontendWebBioGuard/
├── public/                  # Archivos estáticos y favicon
├── src/
│   ├── assets/              # Imágenes, íconos y logotipos
│   ├── components/          # Componentes reutilizables (Navbar, Sidebar, ErrorBoundary, Modal)
│   ├── constants/           # Constantes globales y rutas base de la API
│   ├── context/             # AuthContext y proveedores de estado global
│   ├── pages/               # Vistas principales de la aplicación
│   │   ├── app/             # Vistas protegidas (Dashboard, Salud, Seguridad, Ajustes)
│   │   ├── auth/            # Autenticación (Login, Registro, Recuperación)
│   │   └── public/          # Páginas públicas (Landing, Licenciamientos, Checkout)
│   ├── services/            # Clientes de API REST (pacienteService, sensorService, etc.)
│   ├── types/               # Definiciones de Interfaces y DTOs TypeScript
│   ├── utils/               # Axios httpClient, sanitizadores y formateadores
│   ├── App.tsx              # Configuración de rutas principales y ErrorBoundary
│   └── main.tsx             # Punto de entrada de la aplicación React
├── index.html               # Plantilla HTML5
├── vite.config.ts           # Configuración del empaquetador Vite
└── package.json             # Dependencias y scripts
```

---

## 📡 Endpoints de API Consumidos

La aplicación web interactúa con los siguientes controladores principales de la API Backend:

* **`/api/Auth`**: Inicio de sesión (`/login-web`), registro de dueños (`/register`) y revocación de sesión (`/logout`).
* **`/api/UsuariosWeb`**: Gestión de perfil de usuario y configuración de cuenta.
* **`/api/Pacientes`**: Consulta de expedientes, registro de nuevos pacientes y vinculación.
* **`/api/Sensores`**: Lecturas en tiempo real y resúmenes estadísticos de biomarcadores (PPG, SpO2, HRV, Temperatura, Sudoración).
* **`/api/Alertas`**: Monitoreo de alertas metabólicas, filtro por estado y resolución de emergencias.
* **`/api/Cuidadores`**: Asignación de cuidadores secundarios y actualización de niveles de permiso (`PATCH /nivel-acceso`).
* **`/api/Planes` & `/api/Pagos`**: Consulta de suscripciones y checkout mediante Stripe Webhooks.

---

## 🔒 Seguridad e Integridad

1. **Tokens JWT**: El token JWT se almacena de forma segura y se inyecta en cada cabecera HTTP a través de interceptores Axios (`Authorization: Bearer <token>`).
2. **Cancelación de Peticiones**: Los efectos `useEffect` de las vistas protegidas utilizan `AbortController` para abortar peticiones al desmontar la vista o actualizar filtros.
3. **Manejo de Errores UX**: Excepciones capturadas mediante el componente `ErrorBoundary`, evitando pantallas en blanco o mensajes de error numéricos crudos.

---

## 🚢 Despliegue en Producción

El proyecto está preparado para desplegarse en plataformas como **DigitalOcean App Platform**, **Vercel** o **Netlify**:

1. Asegúrate de configurar la variable de entorno `VITE_API_URL` apuntando a `https://bioguard-api-lkvnq.ondigitalocean.app`.
2. Ejecuta el comando de construcción: `npm run build`.
3. Sirve la carpeta resultante `dist/` a través de tu servidor web (Nginx / Apache / CDN) redireccionando todas las rutas de SPA a `index.html`.
