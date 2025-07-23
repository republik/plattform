import { UserRow } from '@orbiting/backend-modules-types'
import { PgDb } from 'pogi'
import { Contributor } from '../types'

export class ContributorsRepo {
  #pgdb: PgDb

  constructor(dbConn: PgDb) {
    this.#pgdb = dbConn
  }

  async findUserById(userId: string): Promise<UserRow | null> {
    return this.#pgdb.public.users.findOne({ id: userId })
  }

  async findUsersById(userIds: string[]): Promise<UserRow[] | null> {
    return this.#pgdb.public.users.find({ id: userIds })
  }

  async insertContributors(contributors: Contributor[]) {
    const tx = await this.#pgdb.transactionBegin()
    try {
      const inserted = await tx.publikator.contributors.insertAndGet(contributors)
      await tx.transactionCommit()
      return inserted
    } catch (e) {
      await tx.transactionRollback()
      console.error('Error while trying to insert contributors')
      throw e
    }
  }
}
