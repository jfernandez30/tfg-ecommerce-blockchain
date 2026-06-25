import { useState } from 'react'
import { useWriteContract, useAccount, usePublicClient } from 'wagmi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const CONTRACT_ADDRESS = '0x89839aadba87550f8e90a2fb0df65302a8983556' as const

const CONTRACT_ABI = [
  {
    name: 'registerOrder',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'orderId', type: 'string' },
      { name: 'total', type: 'uint256' }
    ],
    outputs: []
  }
] as const

interface CheckoutPageProps {
  onBack: () => void
  onSuccess: (orderId: string, txHash?: string) => void
}

export default function CheckoutPage({ onBack, onSuccess }: CheckoutPageProps) {
  const { items, total, clearCart } = useCart()
  const { user, authMethod } = useAuth()
  const { address } = useAccount()
  const isWeb3User = authMethod === 'siwe'

  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'idle' | 'blockchain' | 'saving'>('idle')

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    postal: '',
    country: 'España'
  })

  const handleShipping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value })
  }

  const handleConfirm = async () => {
    if (!shipping.name || !shipping.address || !shipping.city || !shipping.postal) {
      setError('Por favor completa todos los datos de envío')
      return
    }
    setError('')
    setLoading(true)

    try {
      const orderItems = items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
      const shippingData = {
        shippingName: shipping.name,
        shippingEmail: shipping.email,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingPostal: shipping.postal,
        shippingCountry: shipping.country
      }

      setStep('saving')
      const data = await api.post('/api/orders', { items: orderItems, ...shippingData })

      if (!data.order) {
        setError(data.error || 'Error al crear el pedido')
        return
      }

      const realOrderId = data.order.id

      if (isWeb3User) {
        setStep('blockchain')
        const totalInCents = BigInt(Math.round(total * 100))
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'registerOrder',
          args: [realOrderId, totalInCents],
          gas: 300000n,
          maxFeePerGas: 30000000000n,
          maxPriorityFeePerGas: 25000000000n
        })
        setStep('saving')
        const receipt = await publicClient!.waitForTransactionReceipt({ hash })
        const txHash = receipt.transactionHash
        await api.put(`/api/orders/${realOrderId}/blockchain`, { txHash })
        clearCart()
        onSuccess(realOrderId, txHash as string)
      } else {
        clearCart()
        onSuccess(realOrderId)
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pedido')
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  const getButtonText = () => {
    if (!loading) return isWeb3User ? 'Confirmar y registrar en blockchain' : 'Confirmar pedido'
    if (step === 'blockchain') return 'Confirmando en MetaMask...'
    if (step === 'saving') return 'Guardando pedido...'
    return 'Procesando...'
  }

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-white transition flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-base font-bold text-white">Checkout</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {isWeb3User && (
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-indigo-300">Pedido con registro blockchain</p>
                  <p className="text-xs text-indigo-500">Tu pedido quedará registrado de forma inmutable en Polygon Amoy</p>
                </div>
              </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">Datos de envío</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nombre completo</label>
                    <input type="text" name="name" value={shipping.name} onChange={handleShipping} className={inputClass} placeholder="Tu nombre" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                    <input type="email" name="email" value={shipping.email} onChange={handleShipping} className={inputClass} placeholder="tu@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Dirección</label>
                  <input type="text" name="address" value={shipping.address} onChange={handleShipping} className={inputClass} placeholder="Calle, número, piso..." required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Ciudad</label>
                    <input type="text" name="city" value={shipping.city} onChange={handleShipping} className={inputClass} placeholder="Madrid" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">C. Postal</label>
                    <input type="text" name="postal" value={shipping.postal} onChange={handleShipping} className={inputClass} placeholder="28001" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">País</label>
                    <input type="text" name="country" value={shipping.country} onChange={handleShipping} className={inputClass} />
                  </div>
                </div>
                {isWeb3User && (
                  <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-xs text-zinc-400 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">Resumen</h2>
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-0.5" />
                          : <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        }
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{product.name}</p>
                        <p className="text-xs text-zinc-500">x{quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white">{(Number(product.price) * quantity).toFixed(2)} €</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Total</span>
                <span className="text-xl font-bold text-white">{total.toFixed(2)} €</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-4 font-bold text-sm transition disabled:opacity-50"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}