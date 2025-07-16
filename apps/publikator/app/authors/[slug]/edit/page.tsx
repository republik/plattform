'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import { Box, Flex, Spinner, Text } from '@radix-ui/themes'
import AuthorForm, { ContributorInput, FormError } from '../../../components/author-form'

const GET_CONTRIBUTOR_QUERY = gql`
  query GetContributor($slug: String!) {
    contributor(slug: $slug) {
      id
      slug
      name
      shortBio
      image
      bio
      userId
      prolitterisId
      gender
    }
  }
`

const UPDATE_CONTRIBUTOR_MUTATION = gql`
  mutation UpdateContributor(
    $id: ID!
    $name: String!
    $shortBio: String
    $image: String
    $userId: ID
    $prolitterisId: String
    $prolitterisFirstname: String
    $prolitterisLastname: String
    $gender: GenderEnum
  ) {
    upsertContributor(
      id: $id
      name: $name
      shortBio: $shortBio
      image: $image
      bio: $bio
      userId: $userId
      prolitterisId: $prolitterisId
      prolitterisFirstname: $prolitterisFirstname
      prolitterisLastname: $prolitterisLastname
      gender: $gender
    ) {
      contributor {
        id
        slug
        name
        shortBio
        image
        bio
        userId
        prolitterisId
        prolitterisFirstname
        prolitterisLastname
        gender
      }
      isNew
      warnings
      errors {
        field
        message
      }
    }
  }
`

const DELETE_CONTRIBUTOR_MUTATION = gql`
  mutation DeleteContributor($id: ID!) {
    deleteContributor(id: $id) {
      success
      errors {
        field
        message
      }
    }
  }
`

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

  const { data, loading, error } = useQuery(GET_CONTRIBUTOR_QUERY, {
    variables: { slug: resolvedParams.slug },
    skip: !resolvedParams.slug,
  })

  const [updateContributor] = useMutation(UPDATE_CONTRIBUTOR_MUTATION, {
    onCompleted: (data) => {
      const result = data.upsertContributor
      
      if (result.errors && result.errors.length > 0) {
        setErrors(result.errors)
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
      setErrors([{ field: null, message: error.message || 'Ein unerwarteter Fehler ist aufgetreten' }])
      setIsSubmitting(false)
    },
  })

  const [deleteContributor] = useMutation(DELETE_CONTRIBUTOR_MUTATION, {
    onCompleted: (data) => {
      const result = data.deleteContributor
      
      if (result.errors && result.errors.length > 0) {
        setErrors(result.errors)
        return
      }
      
      if (result.success) {
        router.push('/authors')
      }
    },
    onError: (error) => {
      console.error('GraphQL Error deleting contributor:', error)
      setErrors([{ field: null, message: error.message || 'Ein unerwarteter Fehler ist aufgetreten' }])
    },
  })

  const handleSubmit = async (formData: ContributorInput) => {
    setIsSubmitting(true)
    
    try {
      // Map form data to mutation variables
      const variables: any = {
        id: data.contributor.id,
        name: formData.name,
        shortBio: formData.shortBio || undefined,
        image: formData.image || undefined,
        userId: formData.userId || undefined,
        prolitterisId: formData.prolitterisId || undefined,
        gender: formData.gender || undefined,
      }

      // Map employee values to backend enums
      if (formData.employee) {
        if (formData.employee === 'present') variables.employee = 'present'
        else if (formData.employee === 'past') variables.employee = 'past'
      }

      await updateContributor({
        variables,
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors([{ field: null, message: 'Ein unerwarteter Fehler ist aufgetreten' }])
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteContributor({
        variables: { id: data.contributor.id }
      })
    } catch (error) {
      console.error('Error deleting contributor:', error)
      setErrors([{ field: null, message: 'Ein unerwarteter Fehler ist aufgetreten' }])
    }
  }

  const handleClearErrors = () => {
    setErrors([])
  }

  const handleClearWarnings = () => {
    setWarnings([])
  }

  if (loading) {
    return (
      <Box p="6">
        <Flex align="center" justify="center" style={{ minHeight: '200px' }}>
          <Spinner size="3" />
        </Flex>
      </Box>
    )
  }

  if (error || !data?.contributor) {
    return (
      <Box p="6">
        <Text color="red">
          Fehler beim Laden der Autor*in-Daten: {error?.message || 'Nicht gefunden'}
        </Text>
      </Box>
    )
  }

  return (
    <AuthorForm
      title="Autor*in bearbeiten"
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