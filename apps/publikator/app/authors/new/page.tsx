'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import AuthorForm, { ContributorInput } from '../../components/author-form'

const CREATE_CONTRIBUTOR_MUTATION = gql`
  mutation CreateContributor($input: ContributorInput!) {
    upsertContributor(input: $input) {
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

export default function NewAuthorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [createContributor] = useMutation(CREATE_CONTRIBUTOR_MUTATION, {
    onCompleted: (data) => {
      router.push(`/authors/${data.upsertContributor.slug}/edit`)
    },
    onError: (error) => {
      console.error('Error creating contributor:', error)
    },
  })

  const handleSubmit = async (formData: ContributorInput) => {
    setIsSubmitting(true)

    try {
      await createContributor({
        variables: {
          input: {
            ...formData,
            userId: formData.userId || null,
            prolitterisId: formData.prolitterisId || null,
          },
        },
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthorForm
      title="Neue Autor*in erstellen"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  )
}
