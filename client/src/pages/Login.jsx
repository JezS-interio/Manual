import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, User } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div className="min-h-screen bg-[#0d0d1f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src="/logo.webp" alt="S-interio" className="h-12 object-contain" />
        </div>

        <div className="bg-[#13131f] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-semibold text-white mb-1">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mb-6">Manual interno de S-interio</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                required
                type="text"
                placeholder="Usuario"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className={inp + " pl-9"}
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                required
                type="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={inp + " pl-9"}
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
