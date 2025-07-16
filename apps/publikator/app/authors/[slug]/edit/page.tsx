'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { Box, Flex, Spinner, Text } from '@radix-ui/themes'
import AuthorForm, {
  ContributorInput,
  FormError,
} from '../../../components/author-form'
import {
  ContributorDocument,
  UpsertContributorDocument,
  DeleteContributorDocument,
} from '../../../../graphql/republik-api/__generated__/gql/graphql'

interface EditAuthorPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditAuthorPage({ params }: EditAuthorPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormError[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  const { data, loading, error } = useQuery(ContributorDocument, {
    variables: { slug: resolvedParams.slug },
    skip: !resolvedParams.slug,
  })

  const [updateContributor] = useMutation(UpsertContributorDocument, {
    onCompleted: (data) => {
      const result = data.upsertContributor

      if (result.errors && result.errors.length > 0) {
        setErrors(
          result.errors.map((error) => ({
            field: error.field || null,
            message: error.message,
          })),
        )
        setIsSubmitting(false)
        return
      }

      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings)
      }

      if (result.contributor) {
        router.push('/authors')
      }
    },
    onError: (error) => {
      console.error('GraphQL Error updating contributor:', error)
      setErrors([
        {
          field: null,
          message: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
        },
      ])
      setIsSubmitting(false)
    },
  })

  const [deleteContributor] = useMutation(DeleteContributorDocument, {
    onCompleted: (data) => {
      const result = data.deleteContributor

      if (result.errors && result.errors.length > 0) {
        setErrors(
          result.errors.map((error) => ({
            field: error.field || null,
            message: error.message,
          })),
        )
        return
      }

      if (result.success) {
        router.push('/authors')
      }
    },
    onError: (error) => {
      console.error('GraphQL Error deleting contributor:', error)
      setErrors([
        {
          field: null,
          message: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
        },
      ])
    },
  })

    const handleSubmit = async (formData: ContributorInput) => {
    setIsSubmitting(true)
    
    // Map form data to mutation variables
    const variables: any = {
      id: data.contributor.id,
      name: formData.name,
      shortBio: formData.shortBio || undefined,
      bio: formData.bio || undefined,
      image: formData.image || undefined,
      userId: formData.userId || undefined,
      prolitterisId: formData.prolitterisId || undefined,
      gender: formData.gender || undefined,
      prolitterisFirstname: formData.prolitterisFirstname || undefined,
      prolitterisLastname: formData.prolitterisLastname || undefined,
    }

    await updateContributor({
      variables,
    })
  }

  const handleDelete = async () => {
    await deleteContributor({
      variables: { id: data.contributor.id },
    })
  }

  const handleClearErrors = () => {
    setErrors([])
  }

  const handleClearWarnings = () => {
    setWarnings([])
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
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      isSubmitting={isSubmitting}
      errors={errors}
      warnings={warnings}
      onClearErrors={handleClearErrors}
      onClearWarnings={handleClearWarnings}
    />
  )
}
