import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
// @ts-expect-error - Missing TypeScript declarations for utils module
import { paginate } from '@orbiting/backend-modules-utils'

const { Roles } = Auth

type ContributorFilters = {
  gender?: 'm' | 'f' | 'd'
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
  { pgdb, user }: GraphqlContext,
) {
  // Check if user has permissions to access gender field
  const hasGenderAccess = Roles.userIsInRoles(user, ['admin', 'editor', 'producer'])

  const { orderBy = { field: 'name', direction: 'ASC' }, filters = {} } = args

  // Build WHERE clauses based on filters
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

  // Build ORDER BY clause
  const orderByClause = `${orderBy.field === 'name' ? 'name' : `"${orderBy.field}"`} ${orderBy.direction}`

  // Build the complete query
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  
  // Conditionally include gender field based on user permissions
  const genderField = hasGenderAccess ? 'gender,' : ''
  
  const query = `
    SELECT 
      id,
      name,
      slug,
      short_bio as "shortBio",
      bio,
      image,
      prolitteris_id as "prolitterisId", 
      prolitteris_firstname as "prolitterisFirstname",
      prolitteris_lastname as "prolitterisLastname",
      ${genderField}
      user_id as "userId",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM contributors
    ${whereClause}
    ORDER BY ${orderByClause}
  `

  const contributors = await pgdb.query(query, whereParams)

  return paginate(args, contributors)
}
