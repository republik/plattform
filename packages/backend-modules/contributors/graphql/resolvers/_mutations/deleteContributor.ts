import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
import { ContributorsRepo } from '../../../lib/ContributorsRepo'

const { Roles } = Auth

type DeleteContributorArgs = {
  id: string
}

type DeleteContributorResponse =
  | {
      __typename: "DeleteContributorSuccess"
    }
  | {
      __typename: "DeleteContributorError"
      message: string
    }

export = async function deleteContributor(
  _: unknown,
  { id }: DeleteContributorArgs,
  { pgdb, user: me }: GraphqlContext,
): Promise<DeleteContributorResponse> {
  // Ensure user has appropriate permissions
  Roles.ensureUserIsInRoles(me, ['admin', 'producer'])

  const transaction = await pgdb.transactionBegin()
  const repo = new ContributorsRepo(transaction)

  try {
    // Check if contributor exists
    const contributor = await repo.findContributorByIdOrSlug({id})
    if (!contributor) {
      await transaction.transactionRollback()
      return {
        __typename: "DeleteContributorError",
        message: `Autor*in mit ID ${id} nicht gefunden`,
      }
    }

    // TODO: Check if contributor is associated with any document
    // If user has documents they can't be deleted

    // Delete contributor
    await repo.deleteContributor(id)

    await transaction.transactionCommit()
    return {
      __typename: "DeleteContributorSuccess",
    }
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
