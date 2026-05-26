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
    PENDING: 'Pendiente', CONFIRMED: 'Confirmado', SHIPPED: 'Enviado',
    DELIVERED: 'Entregado', CANCELLED: 'Cancelado'
  }

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    CONFIRMED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    SHIPPED: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    DELIVERED: 'bg-green-500/10 text-green-400 border border-green-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20'
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <header className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white transition flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h1 className="text-base font-bold text-white">Detalle del pedido</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-zinc-500 font-mono">{selected.id}</p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[selected.status]}`}>
                {statusLabel[selected.status]}
              </span>
            </div>
            <div className="space-y-4">
              {selected.items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.product.imageUrl
                        ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain p-1" />
                        : <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.product.name}</p>
                      <p className="text-xs text-zinc-500">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-white">{(Number(item.price) * item.quantity).toFixed(2)} €</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold mt-4 pt-4 border-t border-zinc-800">
              <span className="text-zinc-400">Total</span>
              <span className="text-white">{Number(selected.total).toFixed(2)} €</span>
            </div>
          </div>

          {selected.shippingName && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Datos de envío</h2>
              <div className="text-sm text-zinc-300 space-y-2">
                <p>{selected.shippingName}</p>
                {selected.shippingEmail && <p className="text-zinc-500">{selected.shippingEmail}</p>}
                <p>{selected.shippingAddress}</p>
                <p>{selected.shippingCity}, {selected.shippingPostal}</p>
                <p>{selected.shippingCountry}</p>
              </div>
            </div>
          )}

          {selected.txHash && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">Registro blockchain</h2>
              <p className="text-xs text-zinc-500 font-mono break-all mb-4">{selected.txHash}</p>
              <a href={`https://amoy.polygonscan.com/tx/${selected.txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg px-4 py-2 text-sm font-medium transition">
                Ver en Polygonscan
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-white transition flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-base font-bold text-white">Mis pedidos</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No tienes pedidos todavía.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelected(order)}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-zinc-500 font-mono">{order.id.slice(0, 8)}...</p>
                  <div className="flex items-center gap-2">
                    {order.txHash && (
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                        Blockchain
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} · {new Date(order.createdAt).toLocaleDateString('es-ES')}
                  </p>
                  <p className="font-bold text-white">{Number(order.total).toFixed(2)} €</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}