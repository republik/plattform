'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import { Box, Flex, Spinner, Text } from '@radix-ui/themes'
import AuthorForm, { ContributorInput } from '../../../components/author-form'

const GET_CONTRIBUTOR_QUERY = gql`
  query GetContributor($slug: String!) {
    contributor(slug: $slug) {
      id
      slug
      name
      shortBio
      image
      employee
      userId
      prolitterisId
    }
  }
`

const UPDATE_CONTRIBUTOR_MUTATION = gql`
  mutation UpdateContributor($id: ID!, $input: ContributorInput!) {
    updateContributor(id: $id, input: $input) {
      id
      slug
      name
      shortBio
      image
      employee
      userId
      prolitterisId
    }
  }
`

const DELETE_CONTRIBUTOR_MUTATION = gql`
  mutation DeleteContributor($id: ID!) {
    deleteContributor(id: $id)
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

  const { data, loading, error } = useQuery(GET_CONTRIBUTOR_QUERY, {
    variables: { slug: resolvedParams.slug },
    skip: !resolvedParams.slug,
  })

  const [updateContributor] = useMutation(UPDATE_CONTRIBUTOR_MUTATION, {
    onCompleted: () => {
      router.push('/authors')
    },
    onError: (error) => {
      console.error('Error updating contributor:', error)
    },
  })

  const [deleteContributor] = useMutation(DELETE_CONTRIBUTOR_MUTATION, {
    onCompleted: () => {
      router.push('/authors')
    },
    onError: (error) => {
      console.error('Error deleting contributor:', error)
    },
  })

  const handleSubmit = async (formData: ContributorInput) => {
    setIsSubmitting(true)
    
    try {
      await updateContributor({
        variables: {
          id: data.contributor.id,
          input: {
            ...formData,
            userId: formData.userId || null,
            prolitterisId: formData.prolitterisId || null,
          }
        }
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
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
    }
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
    />
  )
} 