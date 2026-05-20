import { Response } from 'express'
import prisma from '../utils/prisma'
import { AuthRequest } from '../middleware/auth'

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const { items, txHash, blockchainStatus } = req.body

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'El pedido debe contener al menos un producto' })
      return
    }

    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (products.length !== productIds.length) {
      res.status(400).json({ error: 'Uno o más productos no existen' })
      return
    }

    let total = 0
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId)!
      const price = Number(product.price)
      total += price * item.quantity
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      }
    })

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        txHash: txHash || null,
        blockchainStatus: blockchainStatus || 'UNREGISTERED',
        items: { create: orderItems }
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, name: true, walletAddress: true } }
      }
    })

    res.status(201).json({ order })
  } catch (error) {
    console.error('Error creando pedido:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ orders })
  } catch (error) {
    console.error('Error obteniendo pedidos:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)
    const userId = req.userId!

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { product: true } }
      }
    })

    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' })
      return
    }

    res.json({ order })
  } catch (error) {
    console.error('Error obteniendo pedido:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const updateBlockchainStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)
    const userId = req.userId!
    const { txHash } = req.body

    const order = await prisma.order.findFirst({ where: { id, userId } })

    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' })
      return
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { txHash, blockchainStatus: 'CONFIRMED' }
    })

    res.json({ order: updated })
  } catch (error) {
    console.error('Error actualizando blockchain status:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
