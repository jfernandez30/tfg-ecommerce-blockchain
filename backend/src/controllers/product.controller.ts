import { Request, Response } from 'express'
import prisma from '../utils/prisma'

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, search } = req.query

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId: String(categoryId) } : {}),
        ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {})
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ products })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    res.json({ product })
  } catch (error) {
    console.error('Error obteniendo producto:', error)
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
