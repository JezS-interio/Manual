const fs = require('fs');
const b = 'c:/Users/acer/Desktop/Programas/Manual/client/src';

const ProblemCard = `import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'

export default function ProblemCard({ problema, showArea = false }) {
  const tags = problema.tags ? problema.tags.split(',').filter(Boolean) : []
  return (
    <Link to={\`/problema/\${problema.id}\`} className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 block">
      {showArea && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: (problema.area_color||'#6366f1')+'25', color: problema.area_color||'#6366f1', border: \`1px solid \${problema.area_color||'#6366f1'}40\` }}>
            {problema.area_nombre}
          </span>
        </div>
      )}
      <h3 className="font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors leading-snug">{problema.titulo}</h3>
      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{problema.descripcion}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-wrap gap-1">
          {tags.slice(0,3).map(tag => <span key={tag} className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded-full border border-white/10">{tag.trim()}</span>)}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600 shrink-0"><Eye size={12}/><span>{problema.vistas}</span></div>
      </div>
    </Link>
  )
}
`;

const AddAreaModal = `import { useState } from 'react'
import { X, Lock } from 'lucide-react'

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#06b6d4']

export default function AddAreaModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ nombre:'', descripcion:'', color:'#6366f1', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/areas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
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
            <div className="flex gap-2">{COLORS.map(c=><button type="button" key={c} onClick={()=>setForm({...form,color:c})} className={\`w-8 h-8 rounded-full border-2 transition-transform \${form.color===c?'border-white scale-110':'border-transparent'}\`} style={{backgroundColor:c}}/>)}</div>
          </div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Contrasena admin *</label><input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className={inp}/></div>
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
`;

const AddProblemModal = `import { useState, useEffect } from 'react'
import { X, Lock } from 'lucide-react'

export default function AddProblemModal({ onClose, onSuccess, defaultAreaId=null }) {
  const [areas, setAreas] = useState([])
  const [form, setForm] = useState({ area_id: defaultAreaId||'', titulo:'', descripcion:'', solucion:'', tags:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetch('/api/areas').then(r=>r.json()).then(setAreas) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/problemas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, area_id: Number(form.area_id)}) })
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
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Contrasena admin *</label><input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className={inp}/></div>
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
`;

const Area = `import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import ProblemCard from '../components/ProblemCard'
import AddProblemModal from '../components/AddProblemModal'

export default function Area() {
  const { id } = useParams()
  const [area, setArea] = useState(null)
  const [problemas, setProblemas] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([
      fetch('/api/areas').then(r=>r.json()),
      fetch(\`/api/problemas?area_id=\${id}\`).then(r=>r.json())
    ]).then(([areas,probs]) => { setArea(areas.find(a=>a.id===Number(id))); setProblemas(probs); setLoading(false) })
  }
  useEffect(()=>{ load() },[id])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!area) return <p className="text-gray-500">Area no encontrada.</p>

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-4"><ArrowLeft size={16}/> Volver</Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 rounded-full" style={{backgroundColor:area.color}}/>
            <div>
              <h1 className="text-2xl font-bold text-white">{area.nombre}</h1>
              {area.descripcion && <p className="text-gray-500 text-sm mt-0.5">{area.descripcion}</p>}
            </div>
          </div>
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500"><Plus size={16}/> Agregar</button>
        </div>
      </div>
      {problemas.length===0 ? (
        <div className="text-center py-16 text-gray-600"><p>No hay problemas aun.</p><button onClick={()=>setShowAdd(true)} className="mt-3 text-indigo-400 hover:underline text-sm">Agregar el primero</button></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{problemas.map(p=><ProblemCard key={p.id} problema={p}/>)}</div>
      )}
      {showAdd && <AddProblemModal defaultAreaId={id} onClose={()=>setShowAdd(false)} onSuccess={()=>{ setShowAdd(false); load() }}/>}
    </div>
  )
}
`;

const Buscar = `import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import ProblemCard from '../components/ProblemCard'

export default function Buscar() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    fetch(\`/api/problemas?buscar=\${encodeURIComponent(query)}\`).then(r=>r.json()).then(data=>{ setResultados(data); setLoading(false) })
  },[query])

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-4"><ArrowLeft size={16}/> Volver</Link>
        <div className="flex items-center gap-2"><Search size={20} className="text-indigo-400"/><h1 className="text-xl font-bold text-white">Resultados para: <span className="text-indigo-400">"{query}"</span></h1></div>
        {!loading && <p className="text-sm text-gray-500 mt-1">{resultados.length} resultado{resultados.length!==1?'s':''}</p>}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : resultados.length===0 ? (
        <div className="text-center py-16 text-gray-600"><p>No se encontraron resultados</p><Link to="/" className="mt-3 inline-block text-indigo-400 hover:underline text-sm">Ver todas las areas</Link></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{resultados.map(p=><ProblemCard key={p.id} problema={p} showArea/>)}</div>
      )}
    </div>
  )
}
`;

fs.writeFileSync(b+'/components/ProblemCard.jsx', ProblemCard, 'utf8');
fs.writeFileSync(b+'/components/AddAreaModal.jsx', AddAreaModal, 'utf8');
fs.writeFileSync(b+'/components/AddProblemModal.jsx', AddProblemModal, 'utf8');
fs.writeFileSync(b+'/pages/Area.jsx', Area, 'utf8');
fs.writeFileSync(b+'/pages/Buscar.jsx', Buscar, 'utf8');

console.log('All files fixed OK');
