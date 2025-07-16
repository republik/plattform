'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import AuthorForm, {
  ContributorInput,
  FormError,
} from '../../components/author-form'
import { UpsertContributorDocument } from '../../../graphql/republik-api/__generated__/gql/graphql'

export default function NewAuthorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormError[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  const [createContributor] = useMutation(UpsertContributorDocument, {
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
        router.push(`/authors/${result.contributor.slug}/edit`)
      }
    },
    onError: (error) => {
      console.error('GraphQL Error creating contributor:', error)
      setErrors([
        {
          field: null,
          message: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
        },
      ])
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (formData: ContributorInput) => {
    setIsSubmitting(true)

    // Map form data to mutation variables
    const variables: any = {
      name: formData.name,
      shortBio: formData.shortBio || undefined,
      bio: formData.bio || undefined,
      image: formData.image || undefined,
      userId: formData.userId || undefined,
      prolitterisId: formData.prolitterisId || undefined,
      prolitterisFirstname: formData.prolitterisFirstname || undefined,
      prolitterisLastname: formData.prolitterisLastname || undefined,
      gender: formData.gender || undefined,
    }

    await createContributor({
      variables,
    })
  }

  const handleClearErrors = () => {
    setErrors([])
  }

  const handleClearWarnings = () => {
    setWarnings([])
  }

  return (
    <AuthorForm
      title='Neue Autor*in erstellen'
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errors={errors}
      warnings={warnings}
      onClearErrors={handleClearErrors}
      onClearWarnings={handleClearWarnings}
    />
  )
}
