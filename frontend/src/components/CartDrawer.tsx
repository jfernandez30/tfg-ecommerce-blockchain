import { useCart } from '../context/CartContext'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            Carrito ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🛒</p>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 items-start">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    : <span className="text-2xl">📦</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                  <p className="text-indigo-600 font-bold text-sm">{Number(product.price).toFixed(2)} €</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="ml-auto text-red-400 hover:text-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-700">Total</span>
              <span className="text-xl font-bold text-indigo-600">{total.toFixed(2)} €</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 transition"
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
