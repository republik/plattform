import * as jose from 'jose'
import { NextRequest } from 'next/server'
import { COOKIE_NAME, JWT_COOKIE_NAME } from './constants' // Extend jose JWTPayload with our expected payload properties

// Extend jose JWTPayload with our expected onboarded property
export type JWTPayload = jose.JWTPayload & {
  onboarded?: string
}

export function getSessionCookieValue(req: NextRequest): string {
  const cookie = req.cookies.get(COOKIE_NAME)
  return cookie?.value
}

export function getJWTCookieValue(req: NextRequest) {
  const cookie = req.cookies.get(JWT_COOKIE_NAME)
  return cookie?.value
}

/**
 * Load the public key from env-variables and parse to work with `jose`
 */
async function loadPublicKey() {
  const rawPublicKey = process.env.JWT_PUBLIC_KEY
    ? atob(process.env.JWT_PUBLIC_KEY)
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
