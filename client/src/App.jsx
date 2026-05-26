import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Area from './pages/Area'
import Problema from './pages/Problema'
import Buscar from './pages/Buscar'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoutes() {
  const { user } = useAuth()
  // user === undefined → cargando sesión
  if (user === undefined) return (
    <div className="min-h-screen bg-[#0d0d1f] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (user === null) return <Navigate to="/login" replace />
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="area/:id" element={<Area />} />
        <Route path="problema/:id" element={<Problema />} />
        <Route path="buscar" element={<Buscar />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function LoginRedirect() {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />
  return <Login />
}
