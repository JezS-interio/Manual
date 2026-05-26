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
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-8 w-full md:w-auto">
            <Link to="/" className="shrink-0 flex items-center">
              <img src="/logo.webp" alt="Logo" className="h-16 w-auto object-contain mr-4 drop-shadow-lg" style={{marginLeft: '-18px'}} />
            </Link>
            <div className="flex-1 md:flex-none w-full md:w-[420px]">
              <div className="relative group">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  value={buscar}
                  onChange={e => setBuscar(e.target.value)}
                  placeholder="Buscar problema, solución, área..."
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm focus:shadow-indigo-900/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 items-center justify-end w-full md:w-auto mt-2 md:mt-0">
            <button
              className="flex items-center gap-2 bg-white/10 border border-white/10 text-gray-200 px-4 py-2 rounded-xl text-base font-medium hover:bg-white/20 hover:text-indigo-300 transition-colors shadow-sm"
            >
              Auditoría
            </button>
            <button
              onClick={() => setShowAddProblem(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-base font-semibold hover:bg-indigo-500 transition-colors shadow-md"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Agregar problema</span>
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
