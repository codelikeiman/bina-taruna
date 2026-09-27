export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const badRequest = (message: string) => new HttpError(400, message)
export const unauthorized = (message = 'Sesi tidak valid. Silakan login kembali.') =>
  new HttpError(401, message)
export const notFound = (message = 'Data tidak ditemukan.') => new HttpError(404, message)
export const conflict = (message: string) => new HttpError(409, message)
