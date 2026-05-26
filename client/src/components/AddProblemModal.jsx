import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function AddProblemModal({ onClose, onSuccess, defaultAreaId=null }) {
  const [areas, setAreas] = useState([])
  const [form, setForm] = useState({ area_id: defaultAreaId||'', titulo:'', descripcion:'', solucion:'', tags:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetch('/api/areas').then(r=>r.json()).then(setAreas) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/problemas', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({...form, area_id: Number(form.area_id)}) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      onSuccess(data)
    } catch { setError('Error de conexion'); setLoading(false) }
  }

  const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white">Agregar problema</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Area *</label>
            <select required value={form.area_id} onChange={e=>setForm({...form,area_id:e.target.value})} className={inp+" bg-[#0d0d1f]"}>
              <option value="" className="bg-[#0d0d1f]">Seleccionar area...</option>
              {areas.map(a=><option key={a.id} value={a.id} className="bg-[#0d0d1f]">{a.nombre}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Titulo *</label><input required value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} className={inp}/></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Descripcion *</label><textarea required rows={3} value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} className={inp+" resize-none"}/></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Solucion *</label><textarea required rows={4} value={form.solucion} onChange={e=>setForm({...form,solucion:e.target.value})} className={inp+" resize-none"}/></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Etiquetas (separadas por coma)</label><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} className={inp}/></div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-gray-400 py-2 rounded-lg text-sm hover:bg-white/5">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-500 disabled:opacity-50">{loading?'Guardando...':'Publicar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
