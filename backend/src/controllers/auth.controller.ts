import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma'

const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || '',
    { expiresIn: '7d' }
  )
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son obligatorios' })
      return
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(409).json({ error: 'El email ya está registrado' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    })

    const token = generateToken(user.id, user.role)

    res.status(201).json({ user, token })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son obligatorios' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    const token = generateToken(user.id, user.role)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress
      },
      token
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, walletAddress: true, createdAt: true }
    })

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
