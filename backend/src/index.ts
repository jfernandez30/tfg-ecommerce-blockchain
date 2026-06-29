import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import siweRoutes from './routes/siwe.routes'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import orderRoutes from './routes/order.routes'
import adminRoutes from './routes/admin.routes'

dotenv.config()

// Validación de variables de entorno críticas al arranque
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido. El servidor no puede arrancar.')
  process.exit(1)
}

if (!process.env.ALCHEMY_KEY) {
  console.error('ERROR: ALCHEMY_KEY no está definida. El servidor no puede arrancar.')
  process.exit(1)
}

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' })
})

app.use('/api/auth', authRoutes)
app.use('/api/siwe', siweRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

// Solo arranca el servidor en local, no en Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
  })
}

export default app
