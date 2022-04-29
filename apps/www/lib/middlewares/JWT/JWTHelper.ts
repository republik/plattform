import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import JWTInvalidException from './JWTInvalidException'

const publicKey = process.env.JWT_PUBLIC_KEY
  ? Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64')
  : null

async function verifyJWT<Payload extends jwt.JwtPayload>(
  token: string,
): Promise<Payload> {
  return new Promise((resolve, reject) => {
    if (!publicKey) {
      reject(new Error('JWT_PUBLIC_KEY is not defined'))
    }
    jwt.verify(token, publicKey, (err, decoded) => {
      if (err) {
        reject(new JWTInvalidException(err.message))
      } else {
        resolve(decoded as Payload)
      }
    })
  })
}

export async function getJWTPayload<Payload = jwt.JwtPayload>(
  req: NextRequest,
): Promise<Payload | null> {
  const jwtCookie = req.cookies?.['republik-token']
  try {
    const payload = await verifyJWT<Payload>(jwtCookie)
    return payload
  } catch (err) {
    return null
  }
}
