import { PgDb } from 'pogi'

export type NextReadsResult = {
  id: string
  documents: string[]
}

export type NextReadsResolverArgs = {
  repoId: string
  feeds: string[]
}

export type NextReadsResolverResult = { repoId: string; score: number }

export interface NextReadsFeedResolver {
  resolve: (exclude?: string[]) => Promise<NextReadsResolverResult[]>
}

export class PopularLast7DaysFeed implements NextReadsFeedResolver {
  constructor(private pgdb: PgDb) {}

  async resolve(exclude?: string[]): Promise<NextReadsResolverResult[]> {
    return this.pgdb.query(
      `
        SELECT
          "repoId",
          (readings + complete_readings * 3) as score
        FROM
          next_reads.readings_in_the_last_7_days
        WHERE
          "repoId" != ALL(:exclude)
        ORDER BY score DESC
        LIMIT 30;
      `,
      { exclude: exclude },
    )
  }
}

export class PopularLast20DaysCommentsFeed implements NextReadsFeedResolver {
  constructor(private pgdb: PgDb) {}

  async resolve(): Promise<NextReadsResolverResult[]> {
    await this.pgdb.query('select 1') // TODO
    throw new Error('Not implemented')
  }
}
