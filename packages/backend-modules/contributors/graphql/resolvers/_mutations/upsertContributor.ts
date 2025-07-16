import { v4 as isUuid } from 'is-uuid'
import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
// @ts-expect-error - Missing TypeScript declarations for utils module
import { ensureStringLength } from '@orbiting/backend-modules-utils'
// @ts-expect-error - Missing TypeScript declarations for utils module
import slugify from '@orbiting/backend-modules-utils/slugify'

const { Roles } = Auth

const MAX_NAME_LENGTH = 100
const MAX_SHORT_BIO_LENGTH = 500

interface ArticleContributor {
  id: string
  name: string
  slug: string
  short_bio?: string | null
  bio?: string | null
  image?: string | null
  prolitteris_id?: string | null
  prolitteris_first_name?: string | null
  prolitteris_last_name?: string | null
  gender?: string | null
  user_id?: string | null
  created_at: Date
  updated_at: Date
}

type UpsertContributorArgs = {
  id?: string
  name: string
  shortBio?: string
  bio?: string
  image?: string
  prolitterisId?: string
  prolitterisFirstname?: string
  prolitterisLastname?: string
  gender?: string
  userId?: string
}

type UpsertContributorResult = {
  contributor: any | null
  isNew: boolean
  warnings: string[]
  errors: { field: string | null; message: string }[]
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
const validateInput = (
  args: UpsertContributorArgs,
): { field: string | null; message: string }[] => {
  const errors: { field: string | null; message: string }[] = []

  // Name validation
  if (!args.name || args.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name ist erforderlich' })
  }

  try {
    ensureStringLength(args.name, {
      min: 1,
      max: MAX_NAME_LENGTH,
      error: `Name muss zwischen 1 und ${MAX_NAME_LENGTH} Zeichen lang sein`,
    })
  } catch (error) {
    errors.push({ field: 'name', message: (error as Error).message })
  }

  // Short bio validation
  if (args.shortBio) {
    try {
      ensureStringLength(args.shortBio, {
        max: MAX_SHORT_BIO_LENGTH,
        error: `Kurze Biografie darf maximal ${MAX_SHORT_BIO_LENGTH} Zeichen lang sein`,
      })
    } catch (error) {
      errors.push({ field: 'shortBio', message: (error as Error).message })
    }
  }

  // Image URL validation
  if (args.image) {
    if (!isValidUrl(args.image)) {
      errors.push({ field: 'image', message: 'Bild-URL ist ungültig' })
    }
  }

  // Prolitteris validation
  if (args.prolitterisId) {
    // Validate that it's exactly 6 digits
    if (!/^\d{6}$/.test(args.prolitterisId)) {
      errors.push({
        field: 'prolitterisId',
        message: 'Prolitteris ID muss genau 6 Ziffern enthalten',
      })
    }
    // Check if prolitteris_firstname and prolitteris_lastname are set
    if (!args.prolitterisFirstname || !args.prolitterisLastname) {
      errors.push(
        {
          field: 'prolitterisLastname',
          message: 'Nachname ist erforderlich',
        },
        {
          field: 'prolitterisFirstname',
          message: 'Vorname ist erforderlich',
        },
      )
    }
  }

  // Gender validation (ensure it's one of the allowed values)
  if (args.gender && !['m', 'f', 'd', 'na'].includes(args.gender)) {
    errors.push({
      field: 'gender',
      message: 'Geschlecht muss m, f, d oder na sein',
    })
  }

  // UserId validation (basic UUID format check)
  if (args.userId && !isUuid(args.userId)) {
    errors.push({
      field: 'userId',
      message: 'User ID muss ein gültiger UUID sein',
    })
  }

  return errors
}

const findUniqueSlug = async (
  baseSlug: string,
  pgdb: any,
  excludeId: string | null = null,
): Promise<string> => {
  let slug = baseSlug
  let suffix = 1
  let isUnique = false

  while (isUnique === false) {
    const whereClause = excludeId ? { slug, 'id !=': excludeId } : { slug }
    const slugExists = await pgdb.public.contributors.findFirst(whereClause)

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

export = async function upsertContributor(
  _: unknown,
  args: UpsertContributorArgs,
  { pgdb, user: me }: GraphqlContext,
): Promise<UpsertContributorResult> {
  // Ensure user has appropriate permissions
  Roles.ensureUserIsInRoles(me, ['admin', 'producer'])

  // Validate input
  const validationErrors = validateInput(args)
  if (validationErrors.length > 0) {
    return {
      contributor: null,
      isNew: false,
      warnings: [],
      errors: validationErrors,
    }
  }

  const {
    id,
    name,
    shortBio,
    bio,
    image,
    prolitterisId,
    prolitterisFirstname,
    prolitterisLastname,
    gender,
    userId,
  } = args
  const warnings: string[] = []

  const transaction = await pgdb.transactionBegin()

  try {
    // Check for duplicate prolitterisId (error)
    if (prolitterisId) {
      const whereClause = id
        ? { prolitteris_id: prolitterisId, 'id !=': id }
        : { prolitteris_id: prolitterisId }
      const existingContributorWithProlitterisId: ArticleContributor | null =
        await transaction.public.contributors.findFirst(whereClause)

      if (existingContributorWithProlitterisId) {
        await transaction.transactionRollback()
        return {
          contributor: null,
          isNew: false,
          warnings: [],
          errors: [
            {
              field: 'prolitterisId',
              message: `Prolitteris ID ist schon einem*r anderen Autor*in: ${existingContributorWithProlitterisId.slug} zugeordnet`,
            },
          ],
        }
      }
    }

    // Generate unique slug
    const baseSlug = slugify(name)
    const slug = await findUniqueSlug(baseSlug, transaction, id)

    // Check for duplicate names (warning only)
    const whereClause = id ? { name, 'id !=': id } : { name }
    const existingContributorWithName: ArticleContributor | null =
      await transaction.public.contributors.findFirst(whereClause)

    if (existingContributorWithName) {
      warnings.push(
        `Autor*in erstellt. Jdoch existiert ein*e Autor*in bereits mit diesem Namen: ${existingContributorWithName.slug}`,
      )
    }

    const now = new Date()
    const contributorData = {
      name,
      slug,
      ...(shortBio !== undefined && { short_bio: shortBio }),
      ...(bio !== undefined && { bio }),
      ...(image !== undefined && { image }),
      ...(prolitterisId !== undefined && { prolitteris_id: prolitterisId }),
      ...(prolitterisFirstname !== undefined && {
        prolitteris_first_name: prolitterisFirstname,
      }),
      ...(prolitterisLastname !== undefined && {
        prolitteris_last_name: prolitterisLastname,
      }),
      ...(gender !== undefined && { gender }),
      ...(userId !== undefined && { user_id: userId }),
      updated_at: now,
    }

    let contributor
    let isNew = false

    if (id) {
      // Update existing contributor
      const existingContributor: ArticleContributor | null =
        await transaction.public.contributors.findOne({
          id,
        })
      if (!existingContributor) {
        await transaction.transactionRollback()
        return {
          contributor: null,
          isNew: false,
          warnings: [],
          errors: [
            {
              field: 'id',
              message: `Autor*in mit ID ${id} nicht gefunden`,
            },
          ],
        }
      }

      contributor = await transaction.public.contributors.updateAndGetOne(
        { id },
        contributorData,
      )
    } else {
      // Create new contributor
      contributor = await transaction.public.contributors.insertAndGet({
        ...contributorData,
        created_at: now,
      })
      isNew = true
    }

    await transaction.transactionCommit()

    return {
      contributor,
      isNew,
      warnings,
      errors: [],
    }
  } catch (e) {
    await transaction.transactionRollback()
    // Return unexpected errors as error messages instead of throwing
    return {
      contributor: null,
      isNew: false,
      warnings: [],
      errors: [
        {
          field: null,
          message: `Ein unerwarteter Fehler ist aufgetreten: ${
            (e as Error).message
          }`,
        },
      ],
    }
  }
}
