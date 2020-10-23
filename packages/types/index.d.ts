import { PgDb } from 'pogi'

export interface Context {
  pgdb: PgDb
  redis: any
  t: any
}
