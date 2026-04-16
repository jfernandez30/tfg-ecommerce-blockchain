export interface User {
  id: string
  email?: string
  name?: string
  role: 'CUSTOMER' | 'ADMIN'
  walletAddress?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  _count?: { products: number }
}

export interface Product {
  id: string
  name: string
  description?: string
  price: string
  stock: number
  imageUrl?: string
  categoryId: string
  category: Category
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: string
}

export interface Order {
  id: string
  userId: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: string
  txHash?: string
  blockchainStatus: 'UNREGISTERED' | 'PENDING' | 'CONFIRMED'
  createdAt: string
  items: OrderItem[]
}

export interface AuthResponse {
  user: User
  token: string
}


