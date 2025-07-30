'use client'

import { use } from 'react'
import { useQuery } from '@apollo/client'
import { Box, Flex, Spinner, Text } from '@radix-ui/themes'
import AuthorForm from '../../components/author-form'
import {
  ContributorDocument,
} from '../../../graphql/republik-api/__generated__/gql/graphql'

interface EditAuthorPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditAuthorPage({ params }: EditAuthorPageProps) {
  const resolvedParams = use(params)

  const { data, loading, error } = useQuery(ContributorDocument, {
    variables: { slug: resolvedParams.slug },
    skip: !resolvedParams.slug,
  })

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
    />
  )
}
