import { JWTPayload } from 'jose'
import * as Yup from 'yup'

export type Payload = {
  email: string
  roles: string[]
} & JWTPayload

const payloadValidationSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  roles: Yup.array().of(Yup.string()).required(),
})

export function isValidJWTPayload(payload: JWTPayload): payload is Payload {
  return payloadValidationSchema.isValidSync(payload)
}

export class JWTPayloadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JWTPayloadValidationError'
  }
}
