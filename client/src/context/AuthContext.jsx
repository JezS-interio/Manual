import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = cargando, null = no autenticado

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null))
  }, [])

  const login = async (username, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setUser(data.username)
  }

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
