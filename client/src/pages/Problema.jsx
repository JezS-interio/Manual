import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Calendar, Trash2, Edit2, X, Check } from 'lucide-react'

export default function Problema() {
  const { id } = useParams()
  const [problema, setProblema] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ titulo: '', descripcion: '', solucion: '', tags: '' })
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const vistaRegistrada = useRef(false)

  useEffect(() => {
    fetch(`/api/problemas/${id}`)
      .then(r => r.json())
      .then(data => {
        setProblema(data);
        setLoading(false);
        setEditForm({
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          solucion: data.solucion || '',
          tags: data.tags || ''
        });
      })
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

  const tags = (editMode ? editForm.tags : problema.tags) ? (editMode ? editForm.tags : problema.tags).split(',').filter(Boolean) : []
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

        {!editMode ? (
          <div className="flex gap-2 mt-2">
            <button onClick={() => setEditMode(true)} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-200"><Edit2 size={14}/> Editar</button>
          </div>
        ) : null}

        {!editMode ? (
          <h1 className="text-2xl font-bold text-white leading-tight">{problema.titulo}</h1>
        ) : (
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-2xl font-bold text-white mb-2 mt-2"
            value={editForm.titulo}
            onChange={e=>setEditForm(f=>({...f, titulo: e.target.value}))}
          />
        )}
      </div>

      {/* Descripción */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2">El problema</h2>
        {!editMode ? (
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{problema.descripcion}</p>
        ) : (
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-100 mb-2"
            rows={4}
            value={editForm.descripcion}
            onChange={e=>setEditForm(f=>({...f, descripcion: e.target.value}))}
          />
        )}
      </div>

      {/* Solución */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-2">Solución</h2>
        {!editMode ? (
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{problema.solucion}</p>
        ) : (
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-100 mb-2"
            rows={5}
            value={editForm.solucion}
            onChange={e=>setEditForm(f=>({...f, solucion: e.target.value}))}
          />
        )}
      </div>

      {/* Tags */}
      <div>
        <div className="flex flex-wrap gap-2 items-center">
          {!editMode ? (
            tags.length > 0 && tags.map(t => (
              <span key={t} className="text-xs bg-white/5 text-gray-500 px-2.5 py-1 rounded-full border border-white/10">{t.trim()}</span>
            ))
          ) : (
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-100 mb-2"
              value={editForm.tags}
              onChange={e=>setEditForm(f=>({...f, tags: e.target.value}))}
              placeholder="Etiquetas separadas por coma"
            />
          )}
        </div>
      </div>

      {/* Editar/Guardar/Cancelar */}
      {editMode && (
        <div className="flex gap-2 pt-2">
          <button
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-500 disabled:opacity-50"
            disabled={editLoading}
            onClick={async()=>{
              setEditLoading(true); setEditError('');
              const res = await fetch(`/api/problemas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  titulo: editForm.titulo,
                  descripcion: editForm.descripcion,
                  solucion: editForm.solucion,
                  tags: editForm.tags
                })
              });
              const data = await res.json();
              if (!res.ok) { setEditError(data.error||'Error al guardar'); setEditLoading(false); return; }
              setProblema(p=>({...p, ...data}));
              setEditMode(false);
              setEditLoading(false);
            }}
          >
            <Check size={16}/> Guardar
          </button>
          <button
            className="flex items-center gap-1 border border-white/10 text-gray-400 px-4 py-2 rounded-lg text-sm hover:bg-white/5"
            onClick={()=>{ setEditMode(false); setEditError(''); setEditForm({ titulo: problema.titulo, descripcion: problema.descripcion, solucion: problema.solucion, tags: problema.tags }); }}
            type="button"
          >
            <X size={16}/> Cancelar
          </button>
          {editError && <span className="text-red-400 text-sm ml-2">{editError}</span>}
        </div>
      )}

      {/* Eliminar */}
      <div className="pt-4 border-t border-white/10">
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 text-sm text-red-500/60 hover:text-red-400">
            <Trash2 size={14} /> Eliminar
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
