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
    req.log.error('SANITY_WEBHOOK_TOKEN is not set')
    return res.status(500).end()
  }

  const token = req.headers.authorization?.replace(/^Bearer /, '')
  if (!token || !safeCompare(token, secret)) {
    return res.status(401).end()
  }

  next()
}

// Deliberately a distinct secret from SANITY_WEBHOOK_TOKEN: this one is
// shipped into studio's public browser bundle (Sanity inlines every
// SANITY_STUDIO_*-prefixed var at build time), so it must be independently
// rotatable and scoped to read-only access if it ever leaks. Generic (not
// named after any one endpoint) so future read-only routes can share it
// rather than minting a new token each time.
export const verifyReadToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secret = process.env.SANITY_STUDIO_READ_TOKEN
  if (!secret) {
    req.log.error('SANITY_STUDIO_READ_TOKEN is not set')
    return res.status(500).end()
  }

  const token = req.headers.authorization?.replace(/^Bearer /, '')
  if (!token || !safeCompare(token, secret)) {
    return res.status(401).end()
  }

  next()
}
