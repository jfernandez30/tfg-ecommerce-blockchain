import { Response } from 'express'
import prisma from '../utils/prisma'
import { AuthRequest } from '../middleware/auth'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { polygonAmoy } from 'viem/chains'

const CONTRACT_ADDRESS = '0x89839aadba87550f8e90a2fb0df65302a8983556' as const

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(`https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`)
})

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const { items, shippingName, shippingEmail, shippingAddress, shippingCity, shippingPostal, shippingCountry } = req.body

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

    // Descontar stock dentro de una transacción de base de datos
    const order = await prisma.$transaction(async (tx) => {
      // Verificar y descontar stock de cada producto
      for (const item of items) {
        const product = products.find(p => p.id === item.productId)!
        if (Number(product.stock) < item.quantity) {
          throw new Error(`Stock insuficiente para el producto ${product.name}`)
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      return tx.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
          blockchainStatus: 'UNREGISTERED',
          shippingName: shippingName || null,
          shippingEmail: shippingEmail || null,
          shippingAddress: shippingAddress || null,
          shippingCity: shippingCity || null,
          shippingPostal: shippingPostal || null,
          shippingCountry: shippingCountry || null,
          items: { create: orderItems }
        },
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, email: true, name: true, walletAddress: true } }
        }
      })
    })

    res.status(201).json({ order })
  } catch (error: any) {
    console.error('Error creando pedido:', error)
    if (error.message?.includes('Stock insuficiente')) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Error interno del servidor' })
    }
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

    if (!txHash) {
      res.status(400).json({ error: 'txHash es obligatorio' })
      return
    }

    const order = await prisma.order.findFirst({ where: { id, userId } })
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' })
      return
    }

    // Verificar la transacción on-chain
    let receipt
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` })
    } catch {
      res.status(400).json({ error: 'Transacción no encontrada en la blockchain' })
      return
    }

    // Verificar que la transacción está confirmada
    if (receipt.status !== 'success') {
      res.status(400).json({ error: 'La transacción no fue exitosa' })
      return
    }

    // Verificar que se dirigió al contrato correcto
    if (receipt.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
      res.status(400).json({ error: 'La transacción no se dirigió al contrato correcto' })
      return
    }

    // Verificar que emitió el evento OrderRegistered con el orderId correcto
    const orderRegisteredAbi = parseAbiItem('event OrderRegistered(string indexed orderId, address indexed buyer, uint256 total, uint256 timestamp)')
    const logs = await publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: orderRegisteredAbi,
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber
    })

    const matchingLog = logs.find(log => {
      return log.transactionHash.toLowerCase() === txHash.toLowerCase()
    })





    if (!matchingLog) {
      res.status(400).json({ error: 'No se encontró el evento OrderRegistered para este pedido' })
      return
    }

    // Verificar que el importe registrado coincide
    const registeredTotal = Number((matchingLog.args as any).total)
    const expectedTotal = Math.round(Number(order.total) * 100)
    if (registeredTotal !== expectedTotal) {
      res.status(400).json({ error: 'El importe registrado en blockchain no coincide con el pedido' })
      return
    }

    // Todo verificado — actualizar el pedido
    const updated = await prisma.order.update({
      where: { id },
      data: {
        txHash,
        blockchainStatus: 'CONFIRMED',
        status: 'CONFIRMED'
      }
    })

    res.json({ order: updated })
  } catch (error) {
    console.error('Error actualizando blockchain status:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
