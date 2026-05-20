import { Request, Response } from 'express'
import { generateSiweNonce, parseSiweMessage, verifySiweMessage } from 'viem/siwe'
import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma'

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http('https://polygon-amoy.g.alchemy.com/v2/5ssGo3A6fe3rYGzDuAFtA')
})

const generateToken = (userId: string, role: string, walletAddress: string): string => {
  return jwt.sign(
    { userId, role, walletAddress, authMethod: 'siwe' },
    process.env.JWT_SECRET || '',
    { expiresIn: '7d' }
  )
}

export const getNonce = async (req: Request, res: Response): Promise<void> => {
  try {
    const nonce = generateSiweNonce()
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

    const valid = await verifySiweMessage(publicClient, {
      message,
      signature
    })

    if (!valid) {
      res.status(401).json({ error: 'Firma inválida' })
      return
    }

    const parsed = parseSiweMessage(message)
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
