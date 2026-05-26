import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export default function AreaCard({ area }) {
  return (
    <Link
      to={`/area/${area.id}`}
      className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 block"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-1.5 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: area.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors truncate">
            {area.nombre}
          </h3>
          {area.descripcion && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{area.descripcion}</p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
            <FileText size={12} />
            <span>{area.total_problemas} {area.total_problemas === 1 ? 'problema' : 'problemas'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
