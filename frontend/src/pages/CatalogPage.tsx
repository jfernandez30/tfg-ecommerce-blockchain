import { useState, useEffect } from 'react'
import type { Product, Category } from '../types/index'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'

interface CatalogPageProps {
  onCheckout: () => void
  onMyOrders: () => void
}

export default function CatalogPage({ onCheckout, onMyOrders }: CatalogPageProps) {
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

  const handleAddToCart = (product: Product) => {
    addItem(product)
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1500)
  }

  const walletShort = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">TFG Ecommerce</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Hola, {user?.name || user?.email || walletShort}
            </span>
            <button
              onClick={onMyOrders}
              className="text-sm text-gray-500 hover:text-indigo-600 transition"
            >
              Mis pedidos
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition"
            >
              🛒
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-red-500 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No hay productos disponibles todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-300 text-4xl">📦</span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs text-indigo-500 font-medium">{product.category.name}</span>
                  <h3 className="font-semibold text-gray-900 mt-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-indigo-600">{Number(product.price).toFixed(2)} €</span>
                    <span className="text-xs text-gray-400">{product.stock} en stock</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full mt-3 rounded-lg py-2 text-sm font-medium transition ${
                      added === product.id
                        ? 'bg-green-500 text-white'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {added === product.id ? 'Añadido' : product.stock === 0 ? 'Sin stock' : 'Añadir al carrito'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
