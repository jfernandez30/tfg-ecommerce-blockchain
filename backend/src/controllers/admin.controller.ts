import { Request, Response } from 'express'
import prisma from '../utils/prisma'

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, name: true, walletAddress: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ orders })
  } catch (error) {
    console.error('Error obteniendo pedidos:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)
    const { status } = req.body

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    })

    res.json({ order })
  } catch (error) {
    console.error('Error actualizando pedido:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ products })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body

    if (!name || !price || !categoryId) {
      res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios' })
      return
    }

    const product = await prisma.product.create({
      data: { name, description, price, stock: stock || 0, imageUrl, categoryId },
      include: { category: true }
    })

    res.status(201).json({ product })
  } catch (error) {
    console.error('Error creando producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)
    const { name, description, price, stock, imageUrl, categoryId } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, stock, imageUrl, categoryId },
      include: { category: true }
    })

    res.json({ product })
  } catch (error) {
    console.error('Error actualizando producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)
    await prisma.product.delete({ where: { id } })
    res.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error('Error eliminando producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    })
    res.json({ categories })
  } catch (error) {
    console.error('Error obteniendo categorías:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body

    if (!name) {
      res.status(400).json({ error: 'El nombre es obligatorio' })
      return
    }

    const category = await prisma.category.create({
      data: { name, description }
    })

    res.status(201).json({ category })
  } catch (error) {
    console.error('Error creando categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)
    const { name, description } = req.body

    const category = await prisma.category.update({
      where: { id },
      data: { name, description }
    })

    res.json({ category })
  } catch (error) {
    console.error('Error actualizando categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)
    await prisma.category.delete({ where: { id } })
    res.json({ message: 'Categoría eliminada correctamente' })
  } catch (error) {
    console.error('Error eliminando categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
