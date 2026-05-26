import { useState } from 'react'
import { X } from 'lucide-react'

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#06b6d4']

export default function AddAreaModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ nombre:'', descripcion:'', color:'#6366f1' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/areas', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      onSuccess()
    } catch { setError('Error de conexion'); setLoading(false) }
  }

  const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Nueva area</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Nombre *</label><input required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} className={inp}/></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Descripcion</label><input value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} className={inp}/></div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Color</label>
            <div className="flex gap-2">{COLORS.map(c=><button type="button" key={c} onClick={()=>setForm({...form,color:c})} className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color===c?'border-white scale-110':'border-transparent'}`} style={{backgroundColor:c}}/>)}</div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-gray-400 py-2 rounded-lg text-sm hover:bg-white/5">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-500 disabled:opacity-50">{loading?'Guardando...':'Crear area'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
