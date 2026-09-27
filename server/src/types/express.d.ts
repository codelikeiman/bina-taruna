export interface AuthenticatedAdmin {
  id: number
  email: string
  name: string
}

/** Payload token JWT untuk akun pengguna publik (calon siswa/orang tua). */
export interface AuthenticatedUser {
  id: number
  email: string
  name: string
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin
      user?: AuthenticatedUser
    }
  }
}

export {}
