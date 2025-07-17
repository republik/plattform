'use server'

import { getClient } from '../../lib/apollo/client'
import {
  UpsertContributorDocument,
  MutationsUpsertContributorArgs,
  ArticleContributor,
  UpsertContributorError,
  DeleteContributorDocument,
} from '../../graphql/republik-api/__generated__/gql/graphql'

export interface UpdateAuthorState {
  success: boolean
  errors: UpsertContributorError[]
  warnings: string[]
  data?: ArticleContributor
}

export const upsertAuthor = async (
  prevState: UpdateAuthorState,
  formData: FormData,
) => {
  const client = await getClient()
  const data = Object.fromEntries(formData) as MutationsUpsertContributorArgs
  try {
    const result = await client.mutate({
      mutation: UpsertContributorDocument,
      variables: {
        id: data.id || undefined,
        name: data.name,
        shortBio: data.shortBio || undefined,
        image: data.image || undefined,
        bio: data.bio || undefined,
        userId: data.userId || undefined,
        prolitterisId: data.prolitterisId || undefined,
        prolitterisFirstname: data.prolitterisFirstname || undefined,
        prolitterisLastname: data.prolitterisLastname || undefined,
        gender: data.gender,
      },
    })

    const mutationResult = result.data?.upsertContributor

    if (mutationResult?.errors && mutationResult.errors.length > 0) {
      return {
        success: false,
        errors: mutationResult.errors.map((error) => ({
          field: error.field || null,
          message: error.message,
        })),
        warnings: [],
      }
    }

    const warnings = mutationResult?.warnings || []

    if (mutationResult?.contributor) {
      return {
        success: true,
        errors: [],
        warnings: warnings,
        data: mutationResult.contributor,
      }
    }

    return {
      success: false,
      errors: [{ field: null, message: 'Unbekannter Fehler beim Speichern' }],
      warnings: [],
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: null,
          message:
            error instanceof Error
              ? error.message
              : 'Ein unerwarteter Fehler ist aufgetreten',
        },
      ],
      warnings: [],
    }
  }
}

export const deleteAuthor = async (id: string) => {
  const client = await getClient()
  try {
    const result = await client.mutate({
      mutation: DeleteContributorDocument,
      variables: { id },
    })
    return result.data?.deleteContributor
  } catch(error) {
    return {
      success: false,
      errors: [
        { field: null, message: 'Ein unerwarteter Fehler ist aufgetreten' },
      ],
    }
  }
}