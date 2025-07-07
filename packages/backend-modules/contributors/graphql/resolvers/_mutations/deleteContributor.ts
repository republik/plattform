import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'

const { Roles } = Auth

type DeleteContributorArgs = {
  id: string
}

type DeleteContributorResult = {
  success: boolean
  errors: { field: string | null; message: string }[]
}

export = async function deleteContributor(
  _: unknown,
  { id }: DeleteContributorArgs,
  { pgdb, user }: GraphqlContext,
): Promise<DeleteContributorResult> {
  // Ensure user has appropriate permissions
  Roles.ensureUserIsInRoles(user, ['admin', 'producer'])

  const transaction = await pgdb.transactionBegin()
  
  try {
    // Check if contributor exists
    const contributor = await transaction.public.contributors.findOne({ id })
    if (!contributor) {
      await transaction.transactionRollback()
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: `Contributor with ID ${id} not found`,
          },
        ],
      }
    }

    // Check if contributor is associated with any documents
    // Contributors are stored in the meta.contributors array
    const documentAssociations = await transaction.query(`
      SELECT COUNT(*) as count 
      FROM publications.documents d 
      WHERE d.content->'meta'->'contributors' @> $1
    `, [
      JSON.stringify([{ contributor: id }])
    ])
    
    if (documentAssociations[0].count > 0) {
      await transaction.transactionRollback()
      return {
        success: false,
        errors: [
          {
            field: null,
            message: 'Autor*in kann nicht gelöscht werden, da sie mit einem Dokument verknüpft ist',
          },
        ],
      }
    }

    // Delete contributor
    await transaction.public.contributors.deleteOne({ id })
    
    await transaction.transactionCommit()
    return {
      success: true,
      errors: [],
    }
  } catch (e) {
    await transaction.transactionRollback()
    return {
      success: false,
      errors: [
        {
          field: null,
          message: `Ein unerwarteter Fehler ist aufgetreten: ${(e as Error).message}`,
        },
      ],
    }
  }
} 