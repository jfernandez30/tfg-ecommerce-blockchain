import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
  walletAddress?: string
  authMethod?: string
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { 
      userId: string, 
      role: string,
      walletAddress?: string,
      authMethod?: string
    }
    req.userId = decoded.userId
    req.userRole = decoded.role
    req.walletAddress = decoded.walletAddress
    req.authMethod = decoded.authMethod
    next()
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({ error: 'Acceso restringido a administradores' })
    return
  }
  next()
}

export const requireWeb3 = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.authMethod !== 'siwe') {
    res.status(403).json({ error: 'Esta acción requiere autenticación con cartera digital' })
    return
  }
  next()
}
