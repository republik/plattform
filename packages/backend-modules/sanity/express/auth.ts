import { Request, Response, NextFunction } from 'express'
// Brings in the `req.log` augmentation on express's Request.
import type {} from '@orbiting/backend-modules-logger'

import { safeCompare } from '../lib/safeCompare'

/**
 * Middleware asserting the request carries `Authorization: Bearer <secret>`
 * matching the named env var. 500s (not 401s) when the var is unset: that is
 * a deployment fault, not a caller fault.
 */
const verifyBearerToken =
  (envVarName: string) => (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env[envVarName]
    if (!secret) {
      req.log.error(`${envVarName} is not set`)
      return res.status(500).end()
    }

    const token = req.headers.authorization?.replace(/^Bearer /, '')
    if (!token || !safeCompare(token, secret)) {
      return res.status(401).end()
    }

    next()
  }

export const verifySanityToken = verifyBearerToken('SANITY_WEBHOOK_TOKEN')

// Deliberately a distinct secret from SANITY_WEBHOOK_TOKEN: this one is
// shipped into studio's public browser bundle (Sanity inlines every
// SANITY_STUDIO_*-prefixed var at build time), so it must be independently
// rotatable and scoped to read-only access if it ever leaks. Generic (not
// named after any one endpoint) so future read-only routes can share it
// rather than minting a new token each time.
export const verifyReadToken = verifyBearerToken('SANITY_STUDIO_READ_TOKEN')
