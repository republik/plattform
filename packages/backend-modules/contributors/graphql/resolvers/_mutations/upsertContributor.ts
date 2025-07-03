import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
// @ts-expect-error - Missing TypeScript declarations for utils module
import { ensureStringLength } from '@orbiting/backend-modules-utils'
// @ts-expect-error - Missing TypeScript declarations for utils module
import slugify from '@orbiting/backend-modules-utils/slugify'

const { Roles } = Auth

// Maximum length constraints
const MAX_NAME_LENGTH = 100
const MAX_SHORT_BIO_LENGTH = 500

// Input sanitization utility
const sanitizeInput = (input: string): string => {
  if (!input) return input
  
  // Remove potentially dangerous characters while preserving readability
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim()
}

// URL validation utility
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Validate input fields
const validateInput = (args: UpsertContributorArgs): string[] => {
  const errors: string[] = []
  
  // Name validation
  if (!args.name || args.name.trim().length === 0) {
    errors.push('Name ist erforderlich')
  }
  
  try {
    ensureStringLength(args.name, {
      min: 1,
      max: MAX_NAME_LENGTH,
      error: `Name muss zwischen 1 und ${MAX_NAME_LENGTH} Zeichen lang sein`
    })
  } catch (error) {
    errors.push((error as Error).message)
  }
  
  // Short bio validation
  if (args.shortBio) {
    try {
      ensureStringLength(args.shortBio, {
        max: MAX_SHORT_BIO_LENGTH,
        error: `Kurze Biografie darf maximal ${MAX_SHORT_BIO_LENGTH} Zeichen lang sein`
      })
    } catch (error) {
      errors.push((error as Error).message)
    }
  }
  
  // Image URL validation
  if (args.image) {
    if (!isValidUrl(args.image)) {
      errors.push('Bild-URL ist ungültig')
    }
  }
  
  // Prolitteris ID validation
  if (args.prolitterisId) {
    // Validate that it's exactly 6 digits
    if (!/^\d{6}$/.test(args.prolitterisId)) {
      errors.push('Prolitteris ID muss genau 6 Ziffern enthalten')
    }
  }
  
  // Gender validation (ensure it's one of the allowed values)
  if (args.gender && !['m', 'f', 'd'].includes(args.gender)) {
    errors.push('Geschlecht muss m, f oder d sein')
  }
  
  // UserId validation (basic UUID format check)
  if (args.userId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(args.userId)) {
    errors.push('User ID muss ein gültiger UUID sein')
  }
  
  return errors
}

const findUniqueSlug = async (baseSlug: string, pgdb: any, excludeId: string | null = null): Promise<string> => {
  let slug = baseSlug
  let suffix = 1
  let isUnique = false

  while (isUnique === false) {
    const whereClause = excludeId ? { slug, id: { '!=': excludeId } } : { slug }
    const slugExists = await pgdb.public.contributors.findFirst(whereClause)

    if (!slugExists) {
      isUnique = true
    } else {
      // Add numbers: -1, -2, -3, etc.
      slug = `${baseSlug}-${suffix}`
      suffix++
    }
  }

  return slug
}

type UpsertContributorArgs = {
  id?: string
  name: string
  shortBio?: string
  image?: string
  prolitterisId?: string
  prolitterisName?: string
  gender?: string
  userId?: string
  employee?: boolean
}

type UpsertContributorResult = {
  contributor: any
  isNew: boolean
  warnings: string[]
}

export = async function upsertContributor(
  _: unknown,
  args: UpsertContributorArgs,
  { pgdb, user }: GraphqlContext,
): Promise<UpsertContributorResult> {
  // Ensure user has appropriate permissions
  Roles.ensureUserIsInRoles(user, ['admin', 'editor', 'producer'])

  // Validate input
  const validationErrors = validateInput(args)
  if (validationErrors.length > 0) {
    throw new Error(`Validierungsfehler: ${validationErrors.join(', ')}`)
  }

  const { id, name, shortBio, image, prolitterisId, prolitterisName, gender, userId, employee } = args
  const warnings: string[] = []

  // Sanitize input fields
  const sanitizedName = sanitizeInput(name)
  const sanitizedShortBio = shortBio ? sanitizeInput(shortBio) : shortBio
  const sanitizedProlitterisName = prolitterisName ? sanitizeInput(prolitterisName) : prolitterisName

  const transaction = await pgdb.transactionBegin()
  
  try {
    // Check for duplicate names (warning only)
    const whereClauseForName = id ? { name: sanitizedName, id: { '!=': id } } : { name: sanitizedName }
    const existingWithName = await transaction.public.contributors.findFirst(whereClauseForName)
    
    if (existingWithName) {
      warnings.push("Autor*in mit diesem Namen existiert bereits")
    }

    // Check for duplicate prolitterisId (error)
    if (prolitterisId) {
      const whereClauseForProlitteris = id ? { prolitterisId, id: { '!=': id } } : { prolitterisId }
      const existingWithProlitterisId = await transaction.public.contributors.findFirst(whereClauseForProlitteris)
      
      if (existingWithProlitterisId) {
        await transaction.transactionRollback()
        // Sanitize the name in the error message to prevent injection
        const safeName = sanitizeInput(existingWithProlitterisId.name)
        throw new Error(`Prolitteris ID ist schon einem*r anderen Autor*in: ${safeName} zugeordnet`)
      }
    }

    // Generate unique slug
    const baseSlug = slugify(sanitizedName)
    const slug = await findUniqueSlug(baseSlug, transaction, id)

    const now = new Date()
    const contributorData = {
      name: sanitizedName,
      slug,
      ...(sanitizedShortBio !== undefined && { shortBio: sanitizedShortBio }),
      ...(image !== undefined && { image }),
      ...(prolitterisId !== undefined && { prolitterisId }),
      ...(sanitizedProlitterisName !== undefined && { prolitterisName: sanitizedProlitterisName }),
      ...(gender !== undefined && { gender }),
      ...(userId !== undefined && { userId }),
      ...(employee !== undefined && { employee }),
      updatedAt: now
    }

    let contributor
    let isNew = false

    if (id) {
      // Update existing contributor
      const existing = await transaction.public.contributors.findOne({ id })
      if (!existing) {
        await transaction.transactionRollback()
        throw new Error(`Contributor with ID ${id} not found`)
      }
      
      contributor = await transaction.public.contributors.updateAndGetOne(
        { id },
        contributorData
      )
    } else {
      // Create new contributor
      contributor = await transaction.public.contributors.insertAndGet({
        ...contributorData,
        createdAt: now
      })
      isNew = true
    }

    await transaction.transactionCommit()

    return {
      contributor,
      isNew,
      warnings
    }
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
} 