'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import AuthorForm, { FormState } from '../../components/author-form'
import { UpsertContributorDocument } from '../../../graphql/republik-api/__generated__/gql/graphql'

export default function NewAuthorPage() {
  const router = useRouter()

  const [createContributor] = useMutation(UpsertContributorDocument)

  // Action function for useActionState
  const handleSubmitAction = async (
    prevState: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    try {
      // Extract form data
      const contributorData = {
        name: formData.get('name') as string,
        shortBio: (formData.get('shortBio') as string) || undefined,
        bio: (formData.get('bio') as string) || undefined,
        image: (formData.get('image') as string) || undefined,
        userId: (formData.get('userId') as string) || undefined,
        prolitterisId: (formData.get('prolitterisId') as string) || undefined,
        prolitterisFirstname:
          (formData.get('prolitterisFirstname') as string) || undefined,
        prolitterisLastname:
          (formData.get('prolitterisLastname') as string) || undefined,
        gender: (formData.get('gender') as any) || undefined,
      }

      const result = await createContributor({
        variables: contributorData,
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
        // Navigate to edit page on success
        router.push(`/authors/${mutationResult.contributor.slug}`)
        return {
          success: true,
          errors: [],
          warnings: warnings,
          data: mutationResult.contributor,
        }
      }

      return {
        success: false,
        errors: [{ field: null, message: 'Unbekannter Fehler beim Erstellen' }],
        warnings: [],
      }
    } catch (error) {
      console.error('GraphQL Error creating contributor:', error)
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

  return (
    <AuthorForm title='Neue Autor*in erstellen' action={handleSubmitAction} />
  )
}
