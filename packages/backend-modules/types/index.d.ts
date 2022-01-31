import { PgDb } from 'pogi'
import { UserTransformed } from '@orbiting/backend-modules-auth/lib/transformUser'

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
  user?: UserTransformed
}

/**
 * @deprecated Use `ConnectionContext` instead
 */
export interface Context extends GraphqlContext {}
