import { PgDb } from 'pogi'

export type NextReadsResult = {
  id: string
  documents: string[]
}

export type NextReadsResolverArgs = {
  repoId: string
  feeds: string[]
}

export const KNOWN_FEEDS = [
  'POPULAR_LAST_7_DAYS',
  'POPULAR_LAST_20_DAYS_COMMENTS',
]

export function getFeed(_pgdb: PgDb) {
  // pgdb.public.query(`
  // TODO!
  // `)
}
