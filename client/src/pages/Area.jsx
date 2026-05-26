import { useEffect, useState } from 'react'
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
      fetch(`/api/problemas?area_id=${id}`).then(r=>r.json())
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
