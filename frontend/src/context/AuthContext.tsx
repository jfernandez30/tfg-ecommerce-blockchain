import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, AuthResponse } from '../types/index'
import { api } from '../lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      api.get('/api/auth/me').then((data) => {
        if (data.user) setUser(data.user)
        else logout()
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data: AuthResponse = await api.post('/api/auth/login', { email, password })
    if (data.token) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
    } else {
      throw new Error('Credenciales incorrectas')
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const data: AuthResponse = await api.post('/api/auth/register', { email, password, name })
    if (data.token) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
    } else {
      throw new Error('Error en el registro')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
