import { Request, Response } from 'express'
import { generateSiweNonce, parseSiweMessage, verifySiweMessage } from 'viem/siwe'
import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma'

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(`https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`)
})

const nonceStore = new Map<string, number>()
const NONCE_TTL_MS = 5 * 60 * 1000

const generateToken = (userId: string, role: string, walletAddress: string): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está definido')
  return jwt.sign(
    { userId, role, walletAddress, authMethod: 'siwe' },
    secret,
    { expiresIn: '7d' }
  )
}

export const getNonce = async (req: Request, res: Response): Promise<void> => {
  try {
    const nonce = generateSiweNonce()
    nonceStore.set(nonce, Date.now() + NONCE_TTL_MS)
    res.json({ nonce })
  } catch (error) {
    console.error('Error generando nonce:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const verifySiwe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, signature } = req.body
    if (!message || !signature) {
      res.status(400).json({ error: 'Mensaje y firma son obligatorios' })
      return
    }

    const parsed = parseSiweMessage(message)
    const nonce = parsed.nonce

    if (!nonce) {
      res.status(400).json({ error: 'El mensaje SIWE no contiene nonce' })
      return
    }

    const expiry = nonceStore.get(nonce)
    if (!expiry || Date.now() > expiry) {
      res.status(401).json({ error: 'Nonce inválido o expirado' })
      return
    }

    nonceStore.delete(nonce)

    const valid = await verifySiweMessage(publicClient, {
      message,
      signature
    })

    if (!valid) {
      res.status(401).json({ error: 'Firma inválida' })
      return
    }

    const walletAddress = parsed.address!.toLowerCase()

    let user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          role: 'CUSTOMER'
        }
      })
    }

    const token = generateToken(user.id, user.role, walletAddress)
    res.json({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role,
        authMethod: 'siwe'
      },
      token
    })
  } catch (error) {
    console.error('Error verificando SIWE:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
