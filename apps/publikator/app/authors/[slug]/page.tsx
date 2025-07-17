'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { Box, Flex, Spinner, Text } from '@radix-ui/themes'
import AuthorForm, {
  FormState,
} from '../../components/author-form'
import {
  ContributorDocument,
  UpsertContributorDocument,
  DeleteContributorDocument,
  MutationsUpsertContributorArgs,
} from '../../../graphql/republik-api/__generated__/gql/graphql'

interface EditAuthorPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditAuthorPage({ params }: EditAuthorPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()

  const { data, loading, error } = useQuery(ContributorDocument, {
    variables: { slug: resolvedParams.slug },
    skip: !resolvedParams.slug,
  })

  const [updateContributor] = useMutation(UpsertContributorDocument)
  const [deleteContributor] = useMutation(DeleteContributorDocument)

  // Action function for useActionState
  const handleSubmitAction = async (
    prevState: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    try {
      // Extract form data
      const contributorData: MutationsUpsertContributorArgs = {
        id: data?.contributor?.id,
        name: formData.get('name') as string,
        shortBio: (formData.get('shortBio') as string) || undefined,
        bio: (formData.get('bio') as string) || undefined,
        image: (formData.get('image') as string) || undefined,
        userId: (formData.get('userId') as string) || undefined,
        prolitterisId: (formData.get('prolitterisId') as string) || undefined,
        gender: (formData.get('gender') as any) || undefined,
        prolitterisFirstname:
          (formData.get('prolitterisFirstname') as string) || undefined,
        prolitterisLastname:
          (formData.get('prolitterisLastname') as string) || undefined,
      }

      const result = await updateContributor({
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
        // Navigate on success
        router.push('/authors')
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

  const handleDelete = async () => {
    try {
      const result = await deleteContributor({
        variables: { id: data?.contributor?.id },
      })

      const mutationResult = result.data?.deleteContributor

      if (mutationResult?.errors && mutationResult.errors.length > 0) {
        console.error('Fehler beim Löschen des Autors:', mutationResult.errors)
        return
      }

      if (mutationResult?.success) {
        router.push('/authors')
      }
    } catch (error) {
      console.error('GraphQL Fehler beim Löschen des Autors:', error)
    }
  }

  if (loading) {
    return (
      <Box p='6'>
        <Flex align='center' justify='center' style={{ minHeight: '200px' }}>
          <Spinner size='3' />
        </Flex>
      </Box>
    )
  }

  if (error || !data?.contributor) {
    return (
      <Box p='6'>
        <Text color='red'>
          Fehler beim Laden der Autor*in-Daten:{' '}
          {error?.message || 'Nicht gefunden'}
        </Text>
      </Box>
    )
  }

  return (
    <AuthorForm
      title='Autor*in bearbeiten'
      initialData={data.contributor}
      isEdit={true}
      action={handleSubmitAction}
      onDelete={handleDelete}
    />
  )
}
