import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { AuthenticatedAdmin, AuthenticatedUser } from '../types/express'

export function signAdminToken(admin: AuthenticatedAdmin): string {
  return jwt.sign(admin, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyAdminToken(token: string): AuthenticatedAdmin {
  return jwt.verify(token, env.JWT_SECRET) as AuthenticatedAdmin
}

// Secret & expiry TERPISAH dari token admin (lihat catatan USER_JWT_SECRET
// di config/env.ts) supaya token satu peran tidak bisa dipakai memalsukan
// peran yang lain walau salah satu secret bocor.
export function signUserToken(user: AuthenticatedUser): string {
  return jwt.sign(user, env.USER_JWT_SECRET, { expiresIn: env.USER_JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyUserToken(token: string): AuthenticatedUser {
  return jwt.verify(token, env.USER_JWT_SECRET) as AuthenticatedUser
}
