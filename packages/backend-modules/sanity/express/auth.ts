import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'

const safeCompare = (a: string, b: string): boolean => {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) {
    return false
  }
  return timingSafeEqual(bufferA, bufferB)
}

export const verifySanityToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secret = process.env.SANITY_WEBHOOK_TOKEN
  if (!secret) {
    console.error('SANITY_WEBHOOK_TOKEN is not set')
    return res.status(500).end()
  }

  const token = req.headers.authorization?.replace(/^Bearer /, '')
  if (!token || !safeCompare(token, secret)) {
    return res.status(401).end()
  }

  next()
}
