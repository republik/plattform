import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'

const { Roles } = Auth

type DeleteContributorArgs = {
  id: string
}

export = async function deleteContributor(
  _: unknown,
  { id }: DeleteContributorArgs,
  { pgdb, user }: GraphqlContext,
): Promise<boolean> {
  // Ensure user has appropriate permissions
  Roles.ensureUserIsInRoles(user, ['admin', 'editor', 'producer'])

  const transaction = await pgdb.transactionBegin()
  
  try {
    // Check if contributor exists
    const contributor = await transaction.public.contributors.findOne({ id })
    if (!contributor) {
      await transaction.transactionRollback()
      throw new Error(`Contributor with ID ${id} not found`)
    }

    // Check if contributor is associated with any documents
    // Contributors are stored in the meta.contributors field
    const documentAssociations = await transaction.query(`
      SELECT COUNT(*) as count 
      FROM publications.documents d 
      WHERE d.content->'meta'->'contributors' @> $1
    `, [
      JSON.stringify([{ contributor: id }])
    ])
    
    if (documentAssociations[0].count > 0) {
      await transaction.transactionRollback()
      throw new Error('Autor*in kann nicht gelöscht werden, da sie mit einem Dokument verknüpft ist')
    }

    // Delete contributor
    await transaction.public.contributors.deleteOne({ id })
    
    await transaction.transactionCommit()
    return true
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
} 