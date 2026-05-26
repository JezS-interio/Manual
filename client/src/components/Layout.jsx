import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Search, Plus, LogOut } from 'lucide-react'
import AddAreaModal from './AddAreaModal'
import AddProblemModal from './AddProblemModal'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const debounceRef = useRef(null)
  const isSearchPage = location.pathname === '/buscar'
  const urlQuery = isSearchPage ? new URLSearchParams(location.search).get('q') || '' : ''
  const [buscar, setBuscar] = useState(urlQuery)
  const [showAddArea, setShowAddArea] = useState(false)
  const [showAddProblem, setShowAddProblem] = useState(false)
  const skipDebounce = useRef(false)

  // Sync input when navigating away from search page
  useEffect(() => {
    if (!isSearchPage) {
      skipDebounce.current = true
      setBuscar('')
    }
  }, [location.pathname])

  useEffect(() => {
    if (skipDebounce.current) { skipDebounce.current = false; return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (buscar.trim()) {
        navigate(`/buscar?q=${encodeURIComponent(buscar.trim())}`)
      } else if (isSearchPage) {
        navigate('/')
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [buscar])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#10101f] border-b border-white/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="shrink-0">
            <img src="/logo.webp" alt="Logo" className="h-9 w-auto object-contain" />
          </Link>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={buscar}
                onChange={e => setBuscar(e.target.value)}
                placeholder="Buscar problema, solución, área..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              className="flex items-center gap-1 bg-white/5 border border-white/10 text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Auditoría
            </button>
            <button
              onClick={() => setShowAddProblem(true)}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Agregar problema</span>
            </button>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="flex items-center gap-1 bg-white/5 border border-white/10 text-gray-400 px-2 py-2 rounded-lg text-sm hover:bg-white/10 hover:text-gray-200 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet context={{ onAreaCreated: () => window.location.reload(), onProblemCreated: () => {} }} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-sm text-gray-600">
        Manual Empresa — Base de conocimiento interna
      </footer>

      {showAddArea && <AddAreaModal onClose={() => setShowAddArea(false)} onSuccess={() => { setShowAddArea(false); window.location.reload() }} />}
      {showAddProblem && <AddProblemModal onClose={() => setShowAddProblem(false)} onSuccess={() => setShowAddProblem(false)} />}
    </div>
  )
}
