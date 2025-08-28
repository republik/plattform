import { UserRow } from '@orbiting/backend-modules-types'
import { PgDb } from 'pogi'
import {
  Contributor,
  ContributorArgs,
  ContributorRow,
  GsheetAuthor,
  RepoContributor,
  RepoContributorRow,
} from '../types'

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

  async findContributorByIdOrSlug(
    contributorArgs: ContributorArgs,
  ): Promise<ContributorRow> {
    const whereClause = contributorArgs.id
      ? { id: contributorArgs.id }
      : { slug: contributorArgs.slug }
    return this.#pgdb.publikator.contributors.findOne(whereClause)
  }

  async findContributorByCondition(condition: {
    field: string
    value: string
    excludeId?: string
  }): Promise<ContributorRow> {
    const { field, value, excludeId } = condition
    const whereClause = excludeId
      ? { [field]: value, 'id !=': excludeId }
      : { [field]: value }
    return this.#pgdb.publikator.contributors.findFirst(whereClause)
  }

  async deleteContributor(id: string): Promise<void> {
    // deleteOne returns the number of rows deleted (0 or 1) and throws if more than 1 was deleted
    const amountDeleted = await this.#pgdb.publikator.contributors.deleteOne({
      id,
    })
    if (!amountDeleted) {
      throw new Error('No contributor was deleted')
    }
  }

  async insertContributors(
    contributors: Contributor[],
  ): Promise<ContributorRow[]> {
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

  async findAllContributors(): Promise<ContributorRow[]> {
    return this.#pgdb.publikator.contributors.findAll()
  }

  async findExistingSlugs(slugs: string[]): Promise<string[]> {
    if (!slugs.length) {
      return []
    }
    const existingSlugs = await this.#pgdb.publikator.contributors.find(
      { slug: slugs },
      { fields: 'slug' },
    )
    return existingSlugs.map((slugObject: { slug: string }) => slugObject.slug)
  }

  async findUniqueSlug(
    baseSlug: string,
    excludeId: string | null = null,
    existingSlugs?: string[]
  ): Promise<string> {
    let slug = baseSlug
    let suffix = 1
    let isUnique = false

    while (isUnique === false) {
      const whereClause = excludeId ? { slug, 'id !=': excludeId } : { slug }
      const slugExists = await this.#pgdb.publikator.contributors.findFirst(
        whereClause,
      )

      if (!slugExists && !existingSlugs?.includes(slug)) {
        isUnique = true
      } else {
        // Add numbers if name slug already exists: -1, -2, -3, etc.
        slug = `${baseSlug}-${suffix}`
        suffix++
      }
    }

    return slug
  }

  async getGsheetAuthorGenderData(): Promise<GsheetAuthor[]> {
    return this.#pgdb.public.gsheets.findOneFieldOnly(
      { name: 'authors' },
      'data',
    )
  }

  async searchContributors(
    orderByClause: string,
    whereConditions: string[],
    whereParams: { gender?: string; search?: string },
  ): Promise<ContributorRow[]> {
    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    const query = `
    SELECT * FROM publikator.contributors
    ${whereClause}
    ORDER BY ${orderByClause}
  `

    return this.#pgdb.query(query, whereParams)
  }

  // returns repos that are in state published and do not have contributors
  async getReposWithoutContributors(): Promise<string[] | undefined> {
    const query = `SELECT r.id 
        FROM publikator.repos r
        LEFT JOIN publikator."repoContributors" rc ON rc."repoId" = r."id"
        WHERE rc."repoId" IS NULL AND r."currentPhase" = 'published';`
    const repoIds: string[] = await this.#pgdb.queryOneColumn(query)
    return repoIds
  }

  async insertRepoContributors(repoContributors: RepoContributor[]): Promise<RepoContributorRow[]> {
    const tx = await this.#pgdb.transactionBegin()
    try {
      const inserted = await tx.publikator.repoContributors.insertAndGet(
        repoContributors,
      )
      await tx.transactionCommit()
      return inserted
    } catch (e) {
      await tx.transactionRollback()
      console.error('Error while trying to insert repoContributors')
      throw e
    }
  }
}
