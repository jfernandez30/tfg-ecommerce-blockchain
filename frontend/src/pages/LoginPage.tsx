import { useState, FormEvent } from 'react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { createSiweMessage } from 'viem/siwe'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function LoginPage({ onSwitch }: { onSwitch: () => void }) {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { loginWithSiwe, login } = useAuth()

  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConnectWallet = () => {
    connect({ connector: injected() })
  }

  const handleSignIn = async () => {
    if (!address) return
    setError('')
    setLoading(true)
    try {
      const { nonce } = await api.get('/api/siwe/nonce')

      const message = createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Inicia sesión en TFG Ecommerce con tu cartera Ethereum.',
        uri: window.location.origin,
        version: '1',
        chainId: 80002,
        nonce
      })

      const signature = await signMessageAsync({ message })
      await loginWithSiwe(message, signature)
    } catch (err: any) {
      setError(err.message || 'Error al firmar el mensaje')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido</h1>
        <p className="text-gray-500 mb-8">Accede con tu cartera digital o con tu cuenta</p>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {!isConnected ? (
            <button
              onClick={handleConnectWallet}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              Conectar MetaMask
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-4 py-2">
                <p className="text-sm text-indigo-700 font-medium">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <button
                  onClick={() => disconnect()}
                  className="text-xs text-gray-400 hover:text-red-500 transition"
                >
                  Desconectar
                </button>
              </div>
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Firmando mensaje...' : 'Firmar y entrar'}
              </button>
            </div>
          )}
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
            o continúa con email
          </div>
        </div>

        {!showEmail ? (
          <button
            onClick={() => setShowEmail(true)}
            className="w-full border border-gray-300 text-gray-600 rounded-xl py-3 font-medium hover:bg-gray-50 transition"
          >
            Usar email y contraseña
          </button>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 text-white rounded-lg py-2 font-medium hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Entrar'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          No tienes cuenta?{' '}
          <button onClick={onSwitch} className="text-indigo-600 hover:underline font-medium">
            Regístrate
          </button>
        </p>
      </div>
    </div>
  )
}
