import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

interface CheckoutPageProps {
  onBack: () => void
  onSuccess: () => void
}

export default function CheckoutPage({ onBack, onSuccess }: CheckoutPageProps) {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setError('')
    setLoading(true)
    try {
      const orderItems = items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      }))

      const data = await api.post('/api/orders', { items: orderItems })

      if (data.order) {
        clearCart()
        onSuccess()
      } else {
        setError(data.error || 'Error al crear el pedido')
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 transition">
            ← Volver
          </button>
          <h1 className="text-xl font-bold text-gray-900">Resumen del pedido</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
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
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Nombre:</span> {user?.name || 'Sin nombre'}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
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
          {loading ? 'Procesando...' : 'Confirmar pedido'}
        </button>
      </main>
    </div>
  )
}
