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
  scope?: 'request' | 'socket' | 'middleware' | 'master'
  loaders: any
  user?: any
}

/**
 * @deprecated Use `ConnectionContext` instead
 */
export type Context = GraphqlContext
