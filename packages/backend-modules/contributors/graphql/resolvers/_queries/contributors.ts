import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
// @ts-expect-error - Missing TypeScript declarations for utils module
import { paginate } from '@orbiting/backend-modules-utils'

const { Roles } = Auth

type ContributorFilters = {
  employeeStatus?: 'past' | 'present'
  gender?: 'm' | 'f' | 'd'
  hasProlitterisId?: boolean
  hasUserId?: boolean
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
  { pgdb, user }: GraphqlContext,
) {
  // Ensure user has appropriate permissions
  Roles.ensureUserIsInRoles(user, ['admin', 'editor', 'supporter'])

  const { orderBy = { field: 'name', direction: 'ASC' }, filters = {} } = args

  // Build WHERE clauses based on filters
  const whereConditions: string[] = []
  const whereParams: any = {}

  if (filters.employeeStatus) {
    whereConditions.push('employee_status = :employeeStatus')
    whereParams.employeeStatus = filters.employeeStatus
  }

  if (filters.gender) {
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

  // Build ORDER BY clause
  const orderByClause = `${orderBy.field === 'name' ? 'name' : `"${orderBy.field}"`} ${orderBy.direction}`

  // Build the complete query
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  
  const query = `
    SELECT 
      id,
      name,
      slug,
      short_bio as "shortBio",
      image,
      prolitteris_id as "prolitterisId", 
      prolitteris_name as "prolitterisName",
      gender,
      user_id as "userId",
      employee_status as "employee",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM contributors
    ${whereClause}
    ORDER BY ${orderByClause}
  `

  const contributors = await pgdb.query(query, whereParams)

  return paginate(args, contributors)
}
