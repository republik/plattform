'use server'

import { getClient } from '../../../lib/apollo/client'
import {
  UpsertContributorDocument,
  MutationsUpsertContributorArgs,
  ArticleContributor,
  UpsertContributorError,
} from '../../../graphql/republik-api/__generated__/gql/graphql'

export interface UpdateAuthorState {
  success: boolean
  errors?: UpsertContributorError['errors']
  warnings: UpsertContributorError['warnings']
  data?: Partial<ArticleContributor>
}

export const upsertAuthor = async (
  prevState: UpdateAuthorState,
  formData: FormData,
) => {
  const client = await getClient()
  const data = Object.fromEntries(formData) as MutationsUpsertContributorArgs

  // Prepare mutation variables - we'll reuse this for preserving form data
  const submittedFormData = {
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
  }

  try {
    const result = await client.mutate({
      mutation: UpsertContributorDocument,
      variables: submittedFormData,
    })

    const mutationResult = result.data?.upsertContributor

    // Handle error
    if (mutationResult.__typename === 'UpsertContributorError') {
      return {
        success: false,
        errors: mutationResult.errors.map((error) => ({
          field: error.field || null,
          message: error.message,
        })),
        warnings: mutationResult.warnings || [],
        data: submittedFormData,
      }
    }

    // Handle success
    return {
      success: true,
      warnings: mutationResult.warnings || [],
      data: mutationResult.contributor,
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
      data: submittedFormData,
    }
  }
}


