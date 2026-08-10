import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from './context';
import { router } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ui';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" style={{ animation: 'spin 1s linear infinite', borderRadius: '9999px', height: '2rem', width: '2rem', border: '2px solid var(--color-blue)', borderTopColor: 'transparent' }} />
              </div>
          }>
            <RouterProvider router={router} />
          </Suspense>
          <ToastContainer />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
