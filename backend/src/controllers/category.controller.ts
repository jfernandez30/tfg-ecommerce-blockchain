import { Request, Response } from 'express'
import prisma from '../utils/prisma'

export const getCategories = async (req: Request, res: Response): Promise<void> => {
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
