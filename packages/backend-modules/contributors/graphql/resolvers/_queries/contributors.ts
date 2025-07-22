import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
// @ts-expect-error - Missing TypeScript declarations for utils module
import { paginate } from '@orbiting/backend-modules-utils'

const { Roles } = Auth

type ContributorFilters = {
  gender?: 'm' | 'f' | 'd' | 'na'
  hasProlitterisId?: boolean
  hasUserId?: boolean
  search?: string
}

type ContributorOrderBy = {
  field: 'name' | 'createdAt' | 'updatedAt'
  direction: 'ASC' | 'DESC'
}

type ContributorsArgs = {
  first?: number
  last?: number
  before?: string
  after?: string
  orderBy?: ContributorOrderBy
  filters?: ContributorFilters
}

export = async function contributors(
  _: unknown,
  args: ContributorsArgs,
  { pgdb, user: me }: GraphqlContext,
) {
  // Check if user has permissions to access gender field
  const hasGenderAccess = Roles.userIsInRoles(me, [
    'admin',
    'editor',
    'producer',
  ])

  const { orderBy = { field: 'name', direction: 'ASC' }, filters = {} } = args

  const whereConditions: string[] = []
  const whereParams: any = {}

  if (filters.gender) {
    // Only allow gender filtering if user has appropriate permissions
    if (!hasGenderAccess) {
      throw new Error('Insufficient permissions to filter by gender')
    }
    whereConditions.push('gender = :gender')
    whereParams.gender = filters.gender
  }

  if (filters.hasProlitterisId !== undefined) {
    if (filters.hasProlitterisId) {
      whereConditions.push('prolitteris_id IS NOT NULL')
    } else {
      whereConditions.push('prolitteris_id IS NULL')
    }
  }

  if (filters.hasUserId !== undefined) {
    if (filters.hasUserId) {
      whereConditions.push('user_id IS NOT NULL')
    } else {
      whereConditions.push('user_id IS NULL')
    }
  }

  if (filters.search) {
    whereConditions.push('name ILIKE :search')
    whereParams.search = `%${filters.search}%`
  }

  const fieldMapping: Record<string, string> = {
    name: 'name',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
  
  const dbFieldName = fieldMapping[orderBy.field] || orderBy.field
  const orderByClause = `${dbFieldName} ${orderBy.direction}`

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  const query = `
    SELECT * FROM publikator.contributors
    ${whereClause}
    ORDER BY ${orderByClause}
  `

  const contributors = await pgdb.query(query, whereParams)

  return paginate(args, contributors)
}
