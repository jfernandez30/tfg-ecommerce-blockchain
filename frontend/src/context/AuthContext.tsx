import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, AuthResponse } from '../types/index'
import { api } from '../lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  authMethod: 'email' | 'siwe' | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithSiwe: (message: string, signature: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [authMethod, setAuthMethod] = useState<'email' | 'siwe' | null>(
    localStorage.getItem('authMethod') as 'email' | 'siwe' | null
  )
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
      localStorage.setItem('authMethod', 'email')
      setToken(data.token)
      setUser(data.user)
      setAuthMethod('email')
    } else {
      throw new Error('Credenciales incorrectas')
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const data: AuthResponse = await api.post('/api/auth/register', { email, password, name })
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('authMethod', 'email')
      setToken(data.token)
      setUser(data.user)
      setAuthMethod('email')
    } else {
      throw new Error('Error en el registro')
    }
  }

  const loginWithSiwe = async (message: string, signature: string) => {
    const data: AuthResponse = await api.post('/api/siwe/verify', { message, signature })
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('authMethod', 'siwe')
      setToken(data.token)
      setUser(data.user)
      setAuthMethod('siwe')
    } else {
      throw new Error('Error en la autenticación con cartera')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('authMethod')
    setToken(null)
    setUser(null)
    setAuthMethod(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, authMethod, login, register, loginWithSiwe, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
