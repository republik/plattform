import { UserRow } from '@orbiting/backend-modules-types'
import { PgDb } from 'pogi'
import { Contributor, ContributorRow } from '../types'

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

  async insertContributors(contributors: Contributor[]): Promise<ContributorRow[]> {
    const tx = await this.#pgdb.transactionBegin()
    try {
      const inserted = await tx.publikator.contributors.insertAndGet(
        contributors,
      )
      await tx.transactionCommit()
      return inserted
    } catch (e) {
      await tx.transactionRollback()
      console.error('Error while trying to insert contributors')
      throw e
    }
  }

  async findContributorsByName(
    contributorNames: string[],
  ): Promise<ContributorRow[]> {
    return this.#pgdb.publikator.contributors.find({ name: contributorNames })
  }

  async findExistingSlugs(slugs: string[]): Promise<string[]> {
    return this.#pgdb.publikator.contributors.find({ slug: slugs })
  }

  async findUniqueSlug(
    baseSlug: string,
    excludeId: string | null = null,
  ): Promise<string> {
    let slug = baseSlug
    let suffix = 1
    let isUnique = false
  
    while (isUnique === false) {
      const whereClause = excludeId ? { slug, 'id !=': excludeId } : { slug }
      const slugExists = await this.#pgdb.publikator.contributors.findFirst(whereClause)
  
      if (!slugExists) {
        isUnique = true
      } else {
        // Add numbers if name slug already exists: -1, -2, -3, etc.
        slug = `${baseSlug}-${suffix}`
        suffix++
      }
    }
  
    return slug
  }
}
