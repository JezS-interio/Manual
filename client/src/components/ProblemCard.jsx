import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'

export default function ProblemCard({ problema, showArea = false }) {
  const tags = problema.tags ? problema.tags.split(',').filter(Boolean) : []
  return (
    <Link to={`/problema/${problema.id}`} className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 block">
      {showArea && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: (problema.area_color||'#6366f1')+'25', color: problema.area_color||'#6366f1', border: `1px solid ${problema.area_color||'#6366f1'}40` }}>
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
