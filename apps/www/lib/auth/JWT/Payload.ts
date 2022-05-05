import { JWTPayload } from 'jose'

export type Payload = {
  email: string
  roles: string[]
} & JWTPayload

export function isValidJWTPayload(payload: JWTPayload): payload is Payload {
  return (
    typeof payload.email === 'string' &&
    Array.isArray(payload.roles) &&
    payload.roles.every((role) => typeof role === 'string')
  )
}

export class JWTPayloadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JWTPayloadValidationError'
  }
}
