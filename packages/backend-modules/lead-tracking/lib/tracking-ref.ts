import { parse, stringify } from 'uuid'

export function uuidToRef(uuid: string): string {
  const bytes = parse(uuid)
  return Buffer.from(bytes).toString('base64url')
}

export function refToUUID(ref: string): string {
  const bytes = Buffer.from(ref, 'base64url')
  return stringify(bytes)
}
