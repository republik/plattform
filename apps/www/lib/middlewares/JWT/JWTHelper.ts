import * as jose from 'jose'
import { NextRequest } from 'next/server'
import {
  isValidJWTPayload,
  JWTPayloadValidationError,
  Payload,
} from './Payload'

const rawPublicKey = process.env.JWT_PUBLIC_KEY
  ? Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString()
  : null
const issuer = process.env.JWT_ISSUER

async function verifyJWT(token: string): Promise<Payload> {
  console.log('Raw public key:', rawPublicKey)
  const publicKey = await jose.importSPKI(rawPublicKey, 'RS256')
  if (!publicKey) {
    throw new Error('JWT_PUBLIC_KEY is not defined')
  }
  const { payload } = await jose.jwtVerify(token, publicKey, {
    issuer: issuer,
  })
  console.log('Payload', payload)
  if (!isValidJWTPayload(payload)) {
    throw new JWTPayloadValidationError('Invalid JWT payload')
  }
  return payload
}

export async function parseAndVerifyJWT(
  req: NextRequest,
): Promise<Payload | null> {
  try {
    const jwtCookie = req.cookies?.['republik-token']
    if (!jwtCookie) {
      return null
    }
    const payload = await verifyJWT(jwtCookie)
    return payload
  } catch (err) {
    return null
  }
}
