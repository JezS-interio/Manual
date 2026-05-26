import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Layers } from 'lucide-react'
import AreaCard from '../components/AreaCard'
import AddAreaModal from '../components/AddAreaModal'
import ProblemCard from '../components/ProblemCard'

export default function Home() {
  const [areas, setAreas] = useState([])
  const [recientes, setRecientes] = useState([])
  const [showAddArea, setShowAddArea] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([
      fetch('/api/areas').then(r => r.json()),
      fetch('/api/problemas').then(r => r.json())
    ]).then(([a, p]) => {
      setAreas(a)
      setRecientes(p.slice(0, 6))
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white">Base de conocimiento</h1>
        <p className="text-gray-400 mt-2 text-lg">Encontrá soluciones a los problemas más comunes de cada área</p>
      </div>

      {/* Áreas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
            <Layers size={20} className="text-indigo-400" /> Áreas
          </h2>
          <button onClick={() => setShowAddArea(true)} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 font-medium">
            <Plus size={16} /> Nueva área
          </button>
        </div>
        {areas.length === 0 ? (
          <p className="text-gray-600 text-sm">No hay áreas aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map(a => <AreaCard key={a.id} area={a} />)}
          </div>
        )}
      </section>

      {/* Problemas recientes / más vistos */}
      {recientes.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-200">Más consultados</h2>
            <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">ordenado por vistas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recientes.map(p => <ProblemCard key={p.id} problema={p} showArea />)}
          </div>
        </section>
      )}

      {showAddArea && <AddAreaModal onClose={() => setShowAddArea(false)} onSuccess={() => { setShowAddArea(false); load() }} />}
    </div>
  )
}
