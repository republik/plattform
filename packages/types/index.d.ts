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
  loaders: any
}

/**
 * @deprecated Use `ConnectionContext` instead
 */
export interface Context extends GraphqlContext {}
