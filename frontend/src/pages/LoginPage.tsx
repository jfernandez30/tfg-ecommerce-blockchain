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

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="hidden lg:flex flex-1 bg-zinc-900 border-r border-zinc-800 flex-col justify-between p-12">
        <div>
          <h1 className="text-2xl font-bold text-white">TFG Ecommerce</h1>
          <p className="text-zinc-500 text-sm mt-1">Blockchain powered marketplace</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Identidad descentralizada</p>
              <p className="text-xs text-zinc-500 mt-0.5">Autentícate con tu cartera sin depender de terceros</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Pedidos inmutables</p>
              <p className="text-xs text-zinc-500 mt-0.5">Cada compra queda registrada en Polygon Amoy</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Verificación pública</p>
              <p className="text-xs text-zinc-500 mt-0.5">Consulta cualquier transacción en Polygonscan</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-600">TFG · UCAM · Ingeniería Informática · 2026</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
            <p className="text-zinc-500 text-sm mt-1">Accede con tu cartera o con tu cuenta</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Conectar MetaMask
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-zinc-300 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  </div>
                  <button onClick={() => disconnect()} className="text-xs text-zinc-500 hover:text-red-400 transition">
                    Desconectar
                  </button>
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold text-sm transition disabled:opacity-50"
                >
                  {loading ? 'Firmando mensaje...' : 'Firmar y entrar'}
                </button>
              </div>
            )}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="text-xs text-zinc-600 bg-zinc-950 px-3">o continúa con email</span>
            </div>
          </div>

          {!showEmail ? (
            <button
              onClick={() => setShowEmail(true)}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-xl py-3 font-medium text-sm transition"
            >
              Usar email y contraseña
            </button>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="tu@email.com" required />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="Contraseña" required />
              <button type="submit" disabled={loading} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-3 font-medium text-sm transition disabled:opacity-50">
                {loading ? 'Cargando...' : 'Entrar'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-zinc-600 mt-6">
            No tienes cuenta?{' '}
            <button onClick={onSwitch} className="text-indigo-400 hover:text-indigo-300 transition font-medium">
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}