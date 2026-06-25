import { useState, useEffect } from 'react'
import type { Product, Category } from '../types/index'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'

interface CatalogPageProps {
  onCheckout: () => void
  onMyOrders: () => void
  onAdmin?: () => void
  onProductDetail: (product: Product) => void
}

export default function CatalogPage({ onCheckout, onMyOrders, onAdmin, onProductDetail }: CatalogPageProps) {
  const { user, logout } = useAuth()
  const { addItem, itemCount } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [added, setAdded] = useState<string | null>(null)

  useEffect(() => {
    api.get('/api/categories').then(data => setCategories(data.categories || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory) params.append('categoryId', selectedCategory)
    if (search) params.append('search', search)
    const query = params.toString() ? `?${params.toString()}` : ''
    api.get(`/api/products${query}`)
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false))
  }, [selectedCategory, search])

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    addItem(product)
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1500)
  }

  const walletShort = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : null

  const categoryColors: Record<string, string> = {
    'Electronica': 'text-indigo-400',
    'Ropa': 'text-purple-400',
    'Hogar': 'text-green-400',
  }

  const getCategoryColor = (name: string) => categoryColors[name] || 'text-indigo-400'

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-base font-bold text-white tracking-tight">TFG Ecommerce</h1>
          <div className="flex items-center gap-5">
            <span className="text-sm text-zinc-400 hidden sm:block">
              {user?.name || user?.email || walletShort}
            </span>
            {onAdmin && (
              <button onClick={onAdmin} className="text-sm text-zinc-400 hover:text-white transition">Admin</button>
            )}
            <button onClick={onMyOrders} className="text-sm text-zinc-400 hover:text-white transition">Mis pedidos</button>
            <button onClick={() => setCartOpen(true)} className="relative p-2 text-zinc-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={logout} className="text-sm text-zinc-400 hover:text-red-400 transition">Salir</button>
          </div>
        </div>
      </header>

      <div className="border-b border-zinc-900" style={{background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)'}}>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-indigo-500/30 rounded-full px-3 py-1.5 mb-4">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            <span className="text-xs text-indigo-400 font-medium">Powered by Polygon Amoy</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Compra con confianza blockchain</h2>
          <p className="text-sm text-zinc-500">Cada pedido queda registrado de forma inmutable en la red.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedCategory === ''
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {cat.name}
              {cat._count && (
                <span className="ml-2 text-xs opacity-50">{cat._count.products}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No hay productos disponibles.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => onProductDetail(product)}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition cursor-pointer group"
              >
                <div className="h-44 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <span className={`text-xs font-medium ${getCategoryColor(product.category.name)}`}>
                    {product.category.name}
                  </span>
                  <h3 className="font-semibold text-white mt-1 text-sm">{product.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-base font-bold text-white">{Number(product.price).toFixed(2)} €</span>
                    <span className="text-xs text-zinc-500">{product.stock} uds.</span>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.stock === 0}
                    className={`w-full mt-3 rounded-xl py-2 text-sm font-medium transition ${
                      added === product.id
                        ? 'bg-green-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {added === product.id ? 'Añadido' : product.stock === 0 ? 'Sin stock' : 'Añadir al carrito'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false)
          onCheckout()
        }}
      />
    </div>
  )
}