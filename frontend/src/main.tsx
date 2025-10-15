import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Layout from './components/Layout'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ViewMainCollaborator from './pages/ViewMainCollaborator'
import DependentForm from './pages/DependentForm'
import EditCollaborator from './pages/EditCollaborator'
import AdminAudit from './pages/AdminAudit'
import PanelRH from './pages/PanelRH'
import PDFPreview from './pages/PDFPreview'
// import PrivacyPolicy from './pages/PrivacyPolicy' // DESHABILITADO - usar modal

const withLayout = (el: React.ReactNode) => <Layout>{el}</Layout>

const router = createBrowserRouter([
  // Ruta pública: Landing page
  {
    path: '/landing',
    element: <LandingPage />
  },
  
  // Ruta pública: Login
  {
    path: '/login',
    element: <LoginPage />
  },
  
  // Ruta pública: Vista previa del PDF
  {
    path: '/pdf-preview',
    element: <PDFPreview />
  },
  
  // Ruta de desarrollo: Sin autenticación
  {
    path: '/dev',
    element: withLayout(<App />)
  },
  
  // Ruta pública: Aviso de privacidad - DESHABILITADA (usar modal)
  // {
  //   path: '/privacy-policy',
  //   element: <PrivacyPolicy />
  // },
  
  // Rutas de desarrollo: Sin autenticación
  {
    path: '/dev/dependents/new/:employeeId',
    element: withLayout(<DependentForm />)
  },
  {
    path: '/dev/dependents/:id/edit',
    element: withLayout(<DependentForm />)
  },
  {
    path: '/dev/collaborator/:id',
    element: withLayout(<ViewMainCollaborator />)
  },
  {
    path: '/dev/collaborator/:id/edit',
    element: withLayout(<EditCollaborator />)
  },
  {
    path: '/dev/admin/audit',
    element: withLayout(<AdminAudit />)
  },
  {
    path: '/dev/panel',
    element: withLayout(<PanelRH />)
  },
  
  // Rutas protegidas: Requieren autenticación
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/dashboard', element: withLayout(<DashboardPage />) },
      { path: '/collaborator/:id', element: withLayout(<ViewMainCollaborator />) },
      { path: '/collaborator/:id/edit', element: withLayout(<EditCollaborator />) },
      { path: '/dependents/new/:employeeId', element: withLayout(<DependentForm />) },
      { path: '/dependents/:id/edit', element: withLayout(<DependentForm />) },
      { path: '/admin/audit', element: withLayout(<AdminAudit />) },
      { path: '/panel', element: withLayout(<PanelRH />) },
    ]
  }
])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
