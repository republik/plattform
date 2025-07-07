'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import AuthorForm, { ContributorInput, FormError } from '../../components/author-form'

const CREATE_CONTRIBUTOR_MUTATION = gql`
  mutation CreateContributor(
    $name: String!
    $shortBio: String
    $image: String
    $employee: EmployeeStatusEnum
    $userId: ID
    $prolitterisId: String
    $gender: GenderEnum
  ) {
    upsertContributor(
      name: $name
      shortBio: $shortBio
      image: $image
      employee: $employee
      userId: $userId
      prolitterisId: $prolitterisId
      gender: $gender
    ) {
      contributor {
        id
        slug
        name
        shortBio
        image
        employee
        userId
        prolitterisId
        prolitterisName
        gender 
        createdAt
        updatedAt
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

export default function NewAuthorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormError[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  const [createContributor] = useMutation(CREATE_CONTRIBUTOR_MUTATION, {
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
        router.push(`/authors/${result.contributor.slug}/edit`)
      }
    },
    onError: (error) => {
      console.error('GraphQL Error creating contributor:', error)
      setErrors([{ field: null, message: error.message || 'Ein unerwarteter Fehler ist aufgetreten' }])
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (formData: ContributorInput) => {
    setIsSubmitting(true)

    try {
      // Map form data to mutation variables
      const variables: any = {
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

      await createContributor({
        variables,
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors([{ field: null, message: 'Ein unerwarteter Fehler ist aufgetreten' }])
      setIsSubmitting(false)
    }
  }

  const handleClearErrors = () => {
    setErrors([])
  }

  const handleClearWarnings = () => {
    setWarnings([])
  }

  return (
    <AuthorForm
      title="Neue Autor*in erstellen"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errors={errors}
      warnings={warnings}
      onClearErrors={handleClearErrors}
      onClearWarnings={handleClearWarnings}
    />
  )
}
