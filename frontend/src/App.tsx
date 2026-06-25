import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './lib/wagmi'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CatalogPage from './pages/CatalogPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminPage from './pages/AdminPage'
import ProductDetailPage from './pages/ProductDetailPage'
import type { Product } from './types/index'

const queryClient = new QueryClient()
type Page = 'catalog' | 'checkout' | 'success' | 'my-orders' | 'admin' | 'product'

function AppContent() {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [page, setPage] = useState<Page>('catalog')
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [catalogKey, setCatalogKey] = useState(0)

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return showRegister
      ? <RegisterPage onSwitch={() => setShowRegister(false)} />
      : <LoginPage onSwitch={() => setShowRegister(true)} />
  }

  if (page === 'checkout') {
    return (
      <CheckoutPage
        onBack={() => setPage('catalog')}
        onSuccess={(orderId, txHash) => {
          setLastOrderId(orderId)
          setLastTxHash(txHash || null)
          setPage('success')
        }}
      />
    )
  }

  if (page === 'success') {
    return (
      <OrderSuccessPage
        orderId={lastOrderId}
        txHash={lastTxHash}
        onContinue={() => {
          setCatalogKey(k => k + 1)
          setPage('catalog')
        }}
      />
    )
  }

  if (page === 'my-orders') {
    return <MyOrdersPage onBack={() => setPage('catalog')} />
  }

  if (page === 'admin') {
    return <AdminPage onBack={() => setPage('catalog')} />
  }

  if (page === 'product' && selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        onBack={() => setPage('catalog')}
      />
    )
  }

  return (
    <CatalogPage
      key={catalogKey}
      onCheckout={() => setPage('checkout')}
      onMyOrders={() => setPage('my-orders')}
      onAdmin={user.role === 'ADMIN' ? () => setPage('admin') : undefined}
      onProductDetail={(product) => {
        setSelectedProduct(product)
        setPage('product')
      }}
    />
  )
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
