import { useEffect, useState } from 'react'
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
    fetch(`/api/problemas?buscar=${encodeURIComponent(query)}`).then(r=>r.json()).then(data=>{ setResultados(data); setLoading(false) })
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
