import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CatalogPage from './pages/CatalogPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'

type Page = 'catalog' | 'checkout' | 'success'

function AppContent() {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [page, setPage] = useState<Page>('catalog')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
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
        onSuccess={() => setPage('success')}
      />
    )
  }

  if (page === 'success') {
    return (
      <OrderSuccessPage
        onContinue={() => setPage('catalog')}
      />
    )
  }

  return (
    <CatalogPage
      onCheckout={() => setPage('checkout')}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}
