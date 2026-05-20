import { useState } from 'react'
import { useWriteContract, useAccount } from 'wagmi'
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
      const orderItems = items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      }))

      const shippingData = {
        shippingName: shipping.name,
        shippingEmail: shipping.email,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingPostal: shipping.postal,
        shippingCountry: shipping.country
      }

      // Paso 1: crear pedido en BD primero para obtener el ID real
      setStep('saving')
      const data = await api.post('/api/orders', {
        items: orderItems,
        ...shippingData
      })

      if (!data.order) {
        setError(data.error || 'Error al crear el pedido')
        return
      }

      const realOrderId = data.order.id

      if (isWeb3User) {
        // Paso 2: registrar el ID real en blockchain
        setStep('blockchain')
        const totalInCents = BigInt(Math.round(total * 100))

        const txHash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'registerOrder',
          args: [realOrderId, totalInCents],
          gas: 300000n,
          maxFeePerGas: 30000000000n,
          maxPriorityFeePerGas: 25000000000n
        })

        // Paso 3: guardar el txHash en el pedido de BD
        setStep('saving')
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
    if (step === 'blockchain') return 'Firmando transaccion...'
    if (step === 'saving') return 'Guardando pedido...'
    return 'Procesando...'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 transition">
            Volver
          </button>
          <h1 className="text-xl font-bold text-gray-900">Resumen del pedido</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {isWeb3User && (
          <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-indigo-600 text-lg">⛓️</span>
            <div>
              <p className="text-sm font-semibold text-indigo-900">Pedido con registro blockchain</p>
              <p className="text-xs text-indigo-600">Al confirmar, tu pedido quedará registrado de forma inmutable en Polygon Amoy</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Productos</h2>
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      : <span className="text-xl">📦</span>
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-gray-500 text-xs">Cantidad: {quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  {(Number(product.price) * quantity).toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Datos de envío</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  value={shipping.name}
                  onChange={handleShipping}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={shipping.email}
                  onChange={handleShipping}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                name="address"
                value={shipping.address}
                onChange={handleShipping}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Calle, número, piso..."
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  name="city"
                  value={shipping.city}
                  onChange={handleShipping}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Madrid"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código postal</label>
                <input
                  type="text"
                  name="postal"
                  value={shipping.postal}
                  onChange={handleShipping}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="28001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                <input
                  type="text"
                  name="country"
                  value={shipping.country}
                  onChange={handleShipping}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {isWeb3User && (
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Cartera:</span> {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-indigo-600">{total.toFixed(2)} €</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {getButtonText()}
        </button>
      </main>
    </div>
  )
}