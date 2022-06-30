import * as jose from 'jose'
import { NextRequest } from 'next/server'
import { COOKIE_NAME, JWT_COOKIE_NAME } from './constants'

// Extend jose JWTPayload with our expected payload properties
export type JWTPayload = jose.JWTPayload & {
  roles?: string[]
}

export function getSessionCookieValue(req: NextRequest) {
  return req.cookies[COOKIE_NAME]
}

export function getJWTCookieValue(req: NextRequest) {
  return req.cookies[JWT_COOKIE_NAME]
}

/**
 * Load the public key from env-variables and parse to work with `jose`
 */
async function loadPublicKey() {
  const rawPublicKey = process.env.JWT_PUBLIC_KEY
    ? Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString()
    : null
  const publicKey = await jose.importSPKI(rawPublicKey, 'ES256')
  if (!publicKey) {
    throw new Error('JWT_PUBLIC_KEY is not defined')
  }
  return publicKey
}

/**
 * Verify the JWT token and validate the payloads shape
 * @param token
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  const publicKey = await loadPublicKey()
  const { payload } = await jose.jwtVerify(token, publicKey, {
    issuer: process.env.JWT_ISSUER,
  })

  return payload
}
