import { PgDb } from 'pogi'

export interface ConnectionContext {
  elastic: any
  pgdb: PgDb
  redis: any
  pubsub: any
}
export interface GraphqlContext extends ConnectionContext {
  t: any
  signInHooks: any
  mail: any
  scope?: 'request' | 'socket' | 'middleware' | 'scheduler'
  loaders: any
  user?: any
}

/**
 * @deprecated Use `ConnectionContext` instead
 */
export type Context = GraphqlContext

export interface UserRow {
  id: string
  username: string
  firstName: string
  lastName: string
  name: string
  initials: string
  hasPublicProfile: boolean
  portraitUrl: string
  roles: string[]
  email: string
  referralCode: string | null
}

export interface User {
  id: string
  username: string
  slug: string
  firstName: string
  lastName: string
  name: string
  initials: string
  hasPublicProfile: boolean
  // api read access protected by a resolver functions
  roles: string[]
  email: string
  referralCode: string | null
  // use resolver functions to access _raw
  // and expose more fields according to custom logic
  _raw: UserRow
  [key: string]: any
}
