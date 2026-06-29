import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { Product, Category, Order } from '../types/index'

interface AdminPageProps {
  onBack: () => void
}

type Tab = 'orders' | 'products' | 'categories'

export default function AdminPage({ onBack }: AdminPageProps) {
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' })
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    if (tab === 'orders') {
      api.get('/api/admin/orders').then(d => setOrders(d.orders || [])).finally(() => setLoading(false))
    } else if (tab === 'products') {
      Promise.all([api.get('/api/admin/products'), api.get('/api/admin/categories')])
        .then(([p, c]) => { setProducts(p.products || []); setCategories(c.categories || []) })
        .finally(() => setLoading(false))
    } else {
      api.get('/api/admin/categories').then(d => setCategories(d.categories || [])).finally(() => setLoading(false))
    }
  }, [tab])

  const statusLabel: Record<string, string> = {
    PENDING: 'Pendiente', CONFIRMED: 'Confirmado', SHIPPED: 'Enviado',
    DELIVERED: 'Entregado', CANCELLED: 'Cancelado'
  }


  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await api.put(`/api/admin/orders/${id}/status`, { status })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o))
  }

  const handleSaveProduct = async () => {
    if (editingProduct) {
      const data = await api.put(`/api/admin/products/${editingProduct}`, { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) })
      setProducts(prev => prev.map(p => p.id === editingProduct ? data.product : p))
    } else {
      const data = await api.post('/api/admin/products', { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) })
      setProducts(prev => [data.product, ...prev])
    }
    setProductForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' })
    setEditingProduct(null)
    setShowProductForm(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    await api.delete(`/api/admin/products/${id}`)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleEditProduct = (product: Product) => {
    setProductForm({ name: product.name, description: product.description || '', price: product.price, stock: String(product.stock), imageUrl: product.imageUrl || '', categoryId: product.categoryId })
    setEditingProduct(product.id)
    setShowProductForm(true)
  }

  const handleSaveCategory = async () => {
    if (editingCategory) {
      const data = await api.put(`/api/admin/categories/${editingCategory}`, categoryForm)
      setCategories(prev => prev.map(c => c.id === editingCategory ? data.category : c))
    } else {
      const data = await api.post('/api/admin/categories', categoryForm)
      setCategories(prev => [...prev, data.category])
    }
    setCategoryForm({ name: '', description: '' })
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await api.delete(`/api/admin/categories/${id}`)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-zinc-400 hover:text-white transition flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h1 className="text-base font-bold text-white">Panel de administración</h1>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {(['orders', 'products', 'categories'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition ${tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              {t === 'orders' ? 'Pedidos' : t === 'products' ? 'Productos' : 'Categorías'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Cargando...</div>
        ) : tab === 'orders' ? (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-zinc-800/50 transition"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-zinc-500 font-mono mb-1">{order.id}</p>
                      <p className="text-sm text-zinc-300">
                        {(order as any).user?.email || (order as any).user?.walletAddress?.slice(0, 16) + '...'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.txHash && (
                        <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                          Blockchain
                        </span>
                      )}
                      <select
                        value={order.status}
                        onChange={e => { e.stopPropagation(); handleUpdateOrderStatus(order.id, e.target.value) }}
                        onClick={e => e.stopPropagation()}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border-0 cursor-pointer bg-zinc-800 text-zinc-300 focus:outline-none"
                      >
                        {Object.keys(statusLabel).map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                      </select>
                      <svg
                        className={`w-4 h-4 text-zinc-500 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-zinc-500">{order.items.length} productos · {new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
                    <p className="font-bold text-white">{Number(order.total).toFixed(2)} €</p>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-zinc-800 p-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Productos</h3>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.product.imageUrl
                                  ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain p-0.5" />
                                  : <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                }
                              </div>
                              <div>
                                <p className="text-sm text-white">{item.product.name}</p>
                                <p className="text-xs text-zinc-500">x{item.quantity} · {Number(item.price).toFixed(2)} € ud.</p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-white">{(Number(item.price) * item.quantity).toFixed(2)} €</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(order as any).shippingName && (
                      <div>
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Datos de envío</h3>
                        <div className="text-sm text-zinc-300 space-y-1">
                          <p>{(order as any).shippingName}</p>
                          {(order as any).shippingEmail && <p className="text-zinc-500">{(order as any).shippingEmail}</p>}
                          <p>{(order as any).shippingAddress}</p>
                          <p>{(order as any).shippingCity}, {(order as any).shippingPostal} · {(order as any).shippingCountry}</p>
                        </div>
                      </div>
                    )}

                    {order.txHash && (
                      <div>
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Transacción blockchain</h3>
                        <p className="text-xs text-zinc-500 font-mono break-all mb-2">{order.txHash}</p>
                        <a href=
                          {`https://amoy.polygonscan.com/tx/${order.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
                        >
                          Ver en Polygonscan
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : tab === 'products' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Productos ({products.length})</h2>
              <button
                onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' }) }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
              >
                Añadir producto
              </button>
            </div>

            {showProductForm && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-white mb-5">{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nombre</label>
                    <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Categoría</label>
                    <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})} className={inputClass}>
                      <option value="">Seleccionar categoría</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Precio (€)</label>
                    <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Stock</label>
                    <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Descripción</label>
                    <input type="text" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">URL de imagen</label>
                    <input type="text" value={productForm.imageUrl} onChange={e => setProductForm({...productForm, imageUrl: e.target.value})} className={inputClass} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={handleSaveProduct} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition">Guardar</button>
                  <button onClick={() => { setShowProductForm(false); setEditingProduct(null) }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl px-4 py-2 text-sm font-medium transition">Cancelar</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
                        : <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      }
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.category.name} · {product.stock} en stock</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <p className="font-bold text-white">{Number(product.price).toFixed(2)} €</p>
                    <button onClick={() => handleEditProduct(product)} className="text-xs text-zinc-400 hover:text-white transition">Editar</button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-xs text-zinc-400 hover:text-red-400 transition">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Categorías ({categories.length})</h2>
              <button
                onClick={() => { setShowCategoryForm(true); setEditingCategory(null); setCategoryForm({ name: '', description: '' }) }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
              >
                Añadir categoría
              </button>
            </div>

            {showCategoryForm && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-white mb-5">{editingCategory ? 'Editar categoría' : 'Nueva categoría'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nombre</label>
                    <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Descripción</label>
                    <input type="text" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={handleSaveCategory} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition">Guardar</button>
                  <button onClick={() => { setShowCategoryForm(false); setEditingCategory(null) }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl px-4 py-2 text-sm font-medium transition">Cancelar</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">{category.name}</p>
                    <p className="text-xs text-zinc-500">{category.description} · {category._count?.products || 0} productos</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <button onClick={() => { setCategoryForm({ name: category.name, description: category.description || '' }); setEditingCategory(category.id); setShowCategoryForm(true) }} className="text-xs text-zinc-400 hover:text-white transition">Editar</button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="text-xs text-zinc-400 hover:text-red-400 transition">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}