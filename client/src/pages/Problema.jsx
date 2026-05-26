import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Calendar, Trash2 } from 'lucide-react'

export default function Problema() {
  const { id } = useParams()
  const [problema, setProblema] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const vistaRegistrada = useRef(false)

  useEffect(() => {
    fetch(`/api/problemas/${id}`)
      .then(r => r.json())
      .then(data => { setProblema(data); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!loading && problema && !problema.error && !vistaRegistrada.current) {
      vistaRegistrada.current = true
      fetch(`/api/problemas/${id}/vista`, { method: 'POST' })
        .then(r => r.json())
        .then(data => setProblema(prev => prev ? { ...prev, vistas: data.vistas } : prev))
    }
  }, [loading, problema?.id])

  const handleDelete = async (e) => {
    e.preventDefault()
    setDeleteError('')
    const res = await fetch(`/api/problemas/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok) { setDeleteError(data.error); return }
    window.location.href = '/'
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!problema || problema.error) return <p className="text-gray-500">Problema no encontrado.</p>

  const tags = problema.tags ? problema.tags.split(',').filter(Boolean) : []
  const fecha = new Date(problema.creado_en).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link to={`/area/${problema.area_id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-4">
          <ArrowLeft size={16} /> Volver a {problema.area_nombre}
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: (problema.area_color || '#6366f1') + '25', color: problema.area_color || '#6366f1', border: `1px solid ${problema.area_color || '#6366f1'}40` }}
          >
            {problema.area_nombre}
          </span>
          <span className="text-xs text-gray-600 flex items-center gap-1"><Eye size={12} /> {problema.vistas} vistas</span>
          <span className="text-xs text-gray-600 flex items-center gap-1"><Calendar size={12} /> {fecha}</span>
        </div>

        <h1 className="text-2xl font-bold text-white leading-tight">{problema.titulo}</h1>
      </div>

      {/* Descripción */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2">El problema</h2>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{problema.descripcion}</p>
      </div>

      {/* Solución */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-2">✅ Solución</h2>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{problema.solucion}</p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(t => (
            <span key={t} className="text-xs bg-white/5 text-gray-500 px-2.5 py-1 rounded-full border border-white/10">{t.trim()}</span>
          ))}
        </div>
      )}

      {/* Eliminar */}
      <div className="pt-4 border-t border-white/10">
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 text-sm text-red-500/60 hover:text-red-400">
            <Trash2 size={14} /> Eliminar este problema
          </button>
        ) : (
          <form onSubmit={handleDelete} className="flex items-center gap-2">
            <span className="text-sm text-gray-400">¿Confirmar eliminación?</span>
            <button type="submit" className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-500">Eliminar</button>
            <button type="button" onClick={() => setShowDelete(false)} className="text-sm text-gray-500 hover:text-gray-300">Cancelar</button>
            {deleteError && <span className="text-red-400 text-xs">{deleteError}</span>}
          </form>
        )}
      </div>
    </div>
  )
}
