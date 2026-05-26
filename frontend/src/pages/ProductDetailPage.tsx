import { useCart } from '../context/CartContext'
import type { Product } from '../types/index'

interface ProductDetailPageProps {
  product: Product
  onBack: () => void
}

export default function ProductDetailPage({ product, onBack }: ProductDetailPageProps) {
  const { addItem, items } = useCart()
  const inCart = items.find(i => i.product.id === product.id)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-white transition flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-lg font-bold text-white">TFG Ecommerce</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 min-h-[calc(100vh-65px)] flex items-center">
        <div className="w-full">
            <div className="flex flex-row gap-10 items-start">

            <div className="w-96 flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden" style={{height: '400px'}}>
                {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-6" />
                ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-4 pt-2">
                <span className="text-sm text-indigo-400 font-medium">{product.category.name}</span>
                <h1 className="text-3xl font-bold text-white leading-tight">{product.name}</h1>
                <p className="text-zinc-400 text-sm leading-relaxed">{product.description || 'Sin descripción disponible.'}</p>

                <div className="flex items-center justify-between mt-2">
                <span className="text-4xl font-bold text-white">{Number(product.price).toFixed(2)} €</span>
                <span className="text-sm text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                    {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                </span>
                </div>

                {inCart && (
                <p className="text-sm text-indigo-400">
                    Ya tienes {inCart.quantity} unidad{inCart.quantity > 1 ? 'es' : ''} en el carrito
                </p>
                )}

                <button
                onClick={() => addItem(product)}
                disabled={product.stock === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-semibold text-sm transition disabled:opacity-30 disabled:cursor-not-allowed mt-2"
                >
                {product.stock === 0 ? 'Sin stock' : 'Añadir al carrito'}
                </button>

                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Pago verificado en blockchain con Polygon Amoy
                </div>
                </div>
            </div>

            </div>
        </div>
      </main>
    </div>
  )
}