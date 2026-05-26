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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border-l border-zinc-800 w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">
            Carrito {itemCount > 0 && <span className="text-zinc-400 font-normal">({itemCount})</span>}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition text-xl leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-zinc-500 text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 items-start py-4 border-b border-zinc-800 last:border-0">
                <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
                    : <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{product.name}</p>
                  <p className="text-indigo-400 font-semibold text-sm mt-0.5">{Number(product.price).toFixed(2)} €</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="text-zinc-400 hover:text-white transition w-5 h-5 flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-white w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="text-zinc-400 hover:text-white transition w-5 h-5 flex items-center justify-center"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-zinc-500 hover:text-red-400 transition text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white flex-shrink-0">
                  {(Number(product.price) * quantity).toFixed(2)} €
                </p>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm">Total</span>
              <span className="text-xl font-bold text-white">{total.toFixed(2)} €</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold text-sm transition"
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}