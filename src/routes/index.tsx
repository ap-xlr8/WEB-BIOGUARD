import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../constants';
import { AppLayout } from '../components/layout';
import { ProtectedRoute, AdminRoute, PermissionRoute, PublicOnlyRoute } from './guards';
import { APP_PERMISSIONS } from '../auth/authorization';

// Public pages
const LandingPage = lazy(() => import('../pages/public/Landing'));
const CaracteristicasPage = lazy(() => import('../pages/public/Caracteristicas'));
const LicenciamientosPage = lazy(() => import('../pages/public/Licenciamientos'));
const FAQPage = lazy(() => import('../pages/public/FAQ'));
const ContactoPage = lazy(() => import('../pages/public/Contacto'));
const NosotrosPage = lazy(() => import('../pages/public/Nosotros'));
const BlogPage = lazy(() => import('../pages/public/Blog'));
const StatusPage = lazy(() => import('../pages/public/Status'));
const TerminosPage = lazy(() => import('../pages/public/Terminos'));
const PrivacidadPage = lazy(() => import('../pages/public/Privacidad'));
const CookiesPage = lazy(() => import('../pages/public/Cookies'));
const AvisoLegalPage = lazy(() => import('../pages/public/AvisoLegal'));
const NotFoundPage = lazy(() => import('../pages/public/NotFound'));

// Auth pages
const LoginPage = lazy(() => import('../pages/auth/Login'));
const RegisterPage = lazy(() => import('../pages/auth/Register'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmail'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPassword'));

// Payment pages
const CheckoutPage = lazy(() => import('../pages/public/Checkout'));
const SetupCompletePage = lazy(() => import('../pages/public/SetupComplete'));
const PagoExitoPage = lazy(() => import('../pages/public/PagoExito'));
const PagoCanceladoPage = lazy(() => import('../pages/public/PagoCancelado'));

// App pages
const DashboardPage = lazy(() => import('../pages/app/Dashboard'));
const SaludPage = lazy(() => import('../pages/app/Salud'));
const SeguridadPage = lazy(() => import('../pages/app/Seguridad'));
const FacturacionPage = lazy(() => import('../pages/app/Facturacion'));
const AjustesPage = lazy(() => import('../pages/app/Ajustes'));
const SoportePage = lazy(() => import('../pages/app/Soporte'));

// Admin pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsers'));
const AdminTicketsPage = lazy(() => import('../pages/admin/AdminTickets'));

export const router = createBrowserRouter([
  // Publicly accessible pages
  {
    path: ROUTES.HOME,
    element: <LandingPage />,
  },
  {
    path: ROUTES.LICENCIAMIENTOS,
    element: <LicenciamientosPage />,
  },
  {
    path: ROUTES.CARACTERISTICAS,
    element: <CaracteristicasPage />,
  },
  {
    path: ROUTES.FAQ,
    element: <FAQPage />,
  },
  {
    path: ROUTES.CONTACTO,
    element: <ContactoPage />,
  },
  {
    path: ROUTES.NOSOTROS,
    element: <NosotrosPage />,
  },
  {
    path: ROUTES.BLOG,
    element: <BlogPage />,
  },
  {
    path: ROUTES.STATUS,
    element: <StatusPage />,
  },
  {
    path: ROUTES.TERMINOS,
    element: <TerminosPage />,
  },
  {
    path: ROUTES.PRIVACIDAD,
    element: <PrivacidadPage />,
  },
  {
    path: ROUTES.COOKIES,
    element: <CookiesPage />,
  },
  {
    path: ROUTES.AVISO_LEGAL,
    element: <AvisoLegalPage />,
  },
  // Confirmación de correo / 2FA: accesible sin sesión (el registro devuelve
  // requiresVerification sin token; protegerlo aquí redirigía al usuario
  // prematuramente a /login o /dashboard antes de completar la verificación)
  {
    path: ROUTES.CONFIRMAR_CORREO,
    element: <VerifyEmailPage />,
  },

  // Auth pages (Only accessible when NOT logged in)
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTRO, element: <RegisterPage /> },
      { path: ROUTES.RECUPERAR_PASSWORD, element: <ForgotPasswordPage /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
    ],
  },

  // Verification & Payments (Only accessible when logged in)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PermissionRoute anyOf={[APP_PERMISSIONS.BILLING_MANAGE]} />,
        children: [
          { path: ROUTES.CHECKOUT, element: <CheckoutPage /> },
          { path: ROUTES.CONFIGURACION_COMPLETADA, element: <SetupCompletePage /> },
          { path: ROUTES.PAGO_EXITO, element: <PagoExitoPage /> },
          { path: ROUTES.PAGO_CANCELADO, element: <PagoCanceladoPage /> },
        ],
      },

      // Standard App Layout
      {
        element: <AppLayout />,
        children: [
          {
            element: <PermissionRoute anyOf={[APP_PERMISSIONS.PATIENT_CREATE, APP_PERMISSIONS.PATIENT_READ, APP_PERMISSIONS.ALERT_READ]} />,
            children: [{ path: ROUTES.DASHBOARD, element: <DashboardPage /> }],
          },
          {
            element: <PermissionRoute anyOf={[APP_PERMISSIONS.HEALTH_SUMMARY]} />,
            children: [{ path: ROUTES.SALUD, element: <SaludPage /> }],
          },
          {
            element: <PermissionRoute anyOf={[APP_PERMISSIONS.ACCOUNT_SESSIONS]} />,
            children: [{ path: ROUTES.SEGURIDAD, element: <SeguridadPage /> }],
          },
          {
            element: <PermissionRoute anyOf={[APP_PERMISSIONS.BILLING_MANAGE]} />,
            children: [{ path: ROUTES.FACTURACION, element: <FacturacionPage /> }],
          },
          {
            element: <PermissionRoute anyOf={[APP_PERMISSIONS.ACCOUNT_PROFILE]} />,
            children: [
              { path: ROUTES.AJUSTES, element: <AjustesPage /> },
              { path: ROUTES.SOPORTE, element: <SoportePage /> },
            ],
          },
        ],
      },
    ],
  },

  // Administrative Panel (Only accessible to administrators)
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.ADMIN_DASHBOARD, element: <AdminDashboardPage /> },
          { path: ROUTES.ADMIN_USUARIOS, element: <AdminUsersPage /> },
          { path: ROUTES.ADMIN_TICKETS, element: <AdminTicketsPage /> },
        ],
      },
    ],
  },

  // 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
