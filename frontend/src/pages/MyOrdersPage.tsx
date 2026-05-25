import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { Order } from '../types/index'

interface MyOrdersPageProps {
  onBack: () => void
}

export default function MyOrdersPage({ onBack }: MyOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    api.get('/api/orders/my')
      .then(data => setOrders(data.orders || []))
      .finally(() => setLoading(false))
  }, [])

  const statusLabel: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  }

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700 transition">
              Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900">Detalle del pedido</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400 font-mono">{selected.id}</p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[selected.status]}`}>
                {statusLabel[selected.status]}
              </span>
            </div>
            <div className="space-y-3">
              {selected.items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{(Number(item.price) * item.quantity).toFixed(2)} €</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-indigo-600">{Number(selected.total).toFixed(2)} €</span>
            </div>
          </div>

          {selected.shippingName && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Datos de envío</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Nombre:</span> {selected.shippingName}</p>
                {selected.shippingEmail && <p><span className="font-medium">Email:</span> {selected.shippingEmail}</p>}
                <p><span className="font-medium">Dirección:</span> {selected.shippingAddress}</p>
                <p><span className="font-medium">Ciudad:</span> {selected.shippingCity}, {selected.shippingPostal}</p>
                <p><span className="font-medium">País:</span> {selected.shippingCountry}</p>
              </div>
            </div>
          )}

          {selected.txHash && (
            <div className="bg-green-50 rounded-2xl p-6">
              <h2 className="font-semibold text-green-900 mb-2">Registro blockchain</h2>
              <p className="text-xs text-gray-500 font-mono break-all mb-3">{selected.txHash}</p>
              <a href={`https://amoy.polygonscan.com/tx/${selected.txHash}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 transition">
                Ver en Polygonscan
              </a>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 transition">
            Volver
          </button>
          <h1 className="text-xl font-bold text-gray-900">Mis pedidos</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No tienes pedidos todavía.</div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelected(order)}
                className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 font-mono">{order.id.slice(0, 8)}...</p>
                  <div className="flex items-center gap-2">
                    {order.txHash && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Blockchain
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} · {new Date(order.createdAt).toLocaleDateString('es-ES')}
                  </p>
                  <p className="font-bold text-indigo-600">{Number(order.total).toFixed(2)} €</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}